import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JiraClient } from './jira.client';
import type { JiraProject, JiraIssue } from './jira.client';
import { ConnectJiraDto } from './dto/connect-jira.dto';
import { CryptoService } from '../common/crypto.service';

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface JiraConnectionResponse {
  id: string;
  baseUrl: string;
  email: string;
  // ⚠️ apiToken intentionally excluded — never expose credentials in response
  createdAt: Date;
}

export interface JiraProjectResponse {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

export interface StorySyncResult {
  synced: number;
  projectId: string;
}

/**
 * JiraService — orchestrates Jira operations.
 * Controller → JiraService → JiraClient → Jira Cloud API
 * Controller → JiraService → PrismaService → PostgreSQL
 */
@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jiraClient: JiraClient,
    private readonly cryptoService: CryptoService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPER — Get credentials (always scoped by userId)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves the user's Jira connection, decrypts the apiToken, and returns it.
   */
  private async getConnectionOrThrow(userId: string) {
    const connection = await this.prisma.jiraConnection.findFirst({
      where: { userId },
    });

    if (!connection) {
      throw new NotFoundException(
        'No Jira connection found. Please connect via POST /api/jira/connect first.',
      );
    }

    // Decrypt the token for internal use
    try {
      connection.apiToken = this.cryptoService.decrypt(connection.apiToken);
    } catch (error) {
      this.logger.error(`Failed to decrypt Jira token for user ${userId}: ${error.message}`);
      throw new Error('Could not retrieve secure credentials. Please re-connect Jira.');
    }

    return connection;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPER — Transform Jira ADF description to plain text
  // ─────────────────────────────────────────────────────────────────────────────

  private extractPlainText(adfNode: any): string {
    if (!adfNode) return '';
    if (typeof adfNode === 'string') return adfNode;

    let text = '';
    if (Array.isArray(adfNode.content)) {
      for (const node of adfNode.content) {
        if (node.type === 'text' && typeof node.text === 'string') {
          text += node.text;
        } else if (node.content) {
          text += this.extractPlainText(node);
        }
        text += ' ';
      }
    }

    return text.trim();
  }

  private extractAcceptanceCriteria(fields: any): string | null {
    const acFields = [
      'customfield_10016',
      'customfield_10014',
      'customfield_10021',
      'acceptance_criteria',
    ];

    for (const key of acFields) {
      if (fields[key]) {
        return this.extractPlainText(fields[key]);
      }
    }

    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CONNECT — Save/Update Jira credentials
  // ─────────────────────────────────────────────────────────────────────────────

  async connect(
    dto: ConnectJiraDto,
    userId: string,
  ): Promise<JiraConnectionResponse> {
    // Validate credentials against Jira before storing
    this.logger.log(`Validating Jira credentials for user "${userId}"`);
    await this.jiraClient.validateCredentials({
      baseUrl: dto.baseUrl,
      email: dto.email,
      apiToken: dto.apiToken,
    });

    // Encrypt the token before saving
    const encryptedToken = this.cryptoService.encrypt(dto.apiToken);

    // Check if connection already exists for this user
    const existing = await this.prisma.jiraConnection.findFirst({
      where: { userId },
    });

    let connection;

    if (existing) {
      connection = await this.prisma.jiraConnection.update({
        where: { id: existing.id },
        data: {
          baseUrl: dto.baseUrl,
          email: dto.email,
          apiToken: encryptedToken,
        },
      });
      this.logger.log(`Jira connection updated for user "${userId}"`);
    } else {
      connection = await this.prisma.jiraConnection.create({
        data: {
          userId,
          baseUrl: dto.baseUrl,
          email: dto.email,
          apiToken: encryptedToken,
        },
      });
      this.logger.log(`Jira connection created for user "${userId}"`);
    }

    return {
      id: connection.id,
      baseUrl: connection.baseUrl,
      email: connection.email,
      createdAt: connection.createdAt,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. GET PROJECTS — Fetch from Jira using stored credentials
  // ─────────────────────────────────────────────────────────────────────────────

  async getProjects(userId: string): Promise<JiraProjectResponse[]> {
    const connection = await this.getConnectionOrThrow(userId);

    const projects: JiraProject[] = await this.jiraClient.getProjects({
      baseUrl: connection.baseUrl,
      email: connection.email,
      apiToken: connection.apiToken, // Already decrypted by getConnectionOrThrow
    });

    return projects.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      projectTypeKey: p.projectTypeKey,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. SYNC STORIES — Fetch from Jira, transform, persist (de-duped upsert)
  // ─────────────────────────────────────────────────────────────────────────────

  async syncStories(
    internalProjectId: string,
    jiraProjectKey: string,
    userId: string,
  ): Promise<StorySyncResult> {
    const project = await this.prisma.project.findUnique({
      where: { id: internalProjectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException(`Project "${internalProjectId}" not found`);
    }

    const connection = await this.getConnectionOrThrow(userId);

    this.logger.log(
      `Syncing stories for Jira project "${jiraProjectKey}" → internal project "${internalProjectId}"`,
    );

    const issues: JiraIssue[] = await this.jiraClient.getStories(
      {
        baseUrl: connection.baseUrl,
        email: connection.email,
        apiToken: connection.apiToken, // Already decrypted
      },
      jiraProjectKey,
    );

    if (issues.length === 0) {
      return { synced: 0, projectId: internalProjectId };
    }

    let syncedCount = 0;

    for (const issue of issues) {
      const jiraId = issue.key;
      const title = issue.fields.summary ?? '(No summary)';
      const description = this.extractPlainText(issue.fields.description);
      const acceptanceCriteria = this.extractAcceptanceCriteria(issue.fields);

      await this.prisma.userStory.upsert({
        where: { jiraId },
        create: {
          jiraId,
          title,
          description,
          acceptanceCriteria,
          projectId: internalProjectId,
        },
        update: {
          title,
          description,
          acceptanceCriteria,
        },
      });

      syncedCount++;
    }

    return { synced: syncedCount, projectId: internalProjectId };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. GET CONNECTION STATUS — Let frontend know if Jira is connected
  // ─────────────────────────────────────────────────────────────────────────────

  async getConnectionStatus(
    userId: string,
  ): Promise<{ connected: boolean; email?: string; baseUrl?: string }> {
    const connection = await this.prisma.jiraConnection.findFirst({
      where: { userId },
      select: { email: true, baseUrl: true },
    });

    if (!connection) {
      return { connected: false };
    }

    return {
      connected: true,
      email: connection.email,
      baseUrl: connection.baseUrl,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. GET SINGLE ISSUE — For stateless quick generators
  // ─────────────────────────────────────────────────────────────────────────────

  async getIssue(issueKey: string, userId: string) {
    const connection = await this.getConnectionOrThrow(userId);

    const issue = await this.jiraClient.getIssue(
      {
        baseUrl: connection.baseUrl,
        email: connection.email,
        apiToken: connection.apiToken, // Already decrypted
      },
      issueKey,
    );

    const title = issue.fields.summary ?? '(No summary)';
    const description = this.extractPlainText(issue.fields.description);
    const acceptanceCriteria = this.extractAcceptanceCriteria(issue.fields);

    return {
      jiraId: issue.key,
      title,
      description,
      acceptanceCriteria,
    };
  }
}

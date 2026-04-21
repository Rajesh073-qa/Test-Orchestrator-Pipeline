import {
  Injectable,
  BadGatewayException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

// ─── Jira API response shapes (only fields we care about) ────────────────────

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

export interface JiraIssue {
  id: string;
  key: string; // e.g. "PROJ-42"
  fields: {
    summary: string;
    description: string | null; // Jira Cloud returns ADF (Atlassian Document Format) object or null
    // We treat it as any and extract text safely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface JiraIssueSearchResult {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

// ─── Credential shape passed in from JiraService ─────────────────────────────

export interface JiraCredentials {
  baseUrl: string; // e.g. "https://mycompany.atlassian.net"
  email: string;
  apiToken: string; // ⚠️ MVP: plaintext — encrypt in production
}

/**
 * JiraClient — the ONLY place that talks to the Jira REST API.
 * Controller → JiraService → JiraClient (this file) → Jira Cloud
 *
 * Responsibilities:
 *  - Build authenticated fetch headers
 *  - Call Jira API v3 endpoints
 *  - Normalise and return typed data
 *  - Handle all HTTP / network errors centrally
 */
@Injectable()
export class JiraClient {
  private readonly logger = new Logger(JiraClient.name);

  // ─── Private: build headers for Jira Basic Auth ──────────────────────────

  private buildHeaders(creds: JiraCredentials): Record<string, string> {
    // Jira Cloud uses Basic Auth: base64("email:apiToken")
    const encoded = Buffer.from(`${creds.email}:${creds.apiToken}`).toString(
      'base64',
    );
    return {
      Authorization: `Basic ${encoded}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  // ─── Private: safe fetch wrapper with error handling ─────────────────────

  private async jiraFetch<T>(
    creds: JiraCredentials,
    path: string,
  ): Promise<T> {
    const url = `${creds.baseUrl.replace(/\/$/, '')}${path}`;

    this.logger.debug(`Jira API call: GET ${url}`);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(creds),
      });
    } catch (networkError) {
      this.logger.error(`Network error calling Jira: ${String(networkError)}`);
      throw new BadGatewayException(
        'Failed to reach Jira. Check the baseUrl and network connectivity.',
      );
    }

    // 401 → bad credentials
    if (response.status === 401) {
      throw new UnauthorizedException(
        'Jira authentication failed. Check your email and API token.',
      );
    }

    // 403 → valid credentials but no permission
    if (response.status === 403) {
      throw new UnauthorizedException(
        'Jira access denied. Your token may not have required permissions.',
      );
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Jira API error ${response.status}: ${body}`);
      throw new BadGatewayException(
        `Failed to fetch from Jira (HTTP ${response.status})`,
      );
    }

    return response.json() as Promise<T>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch all accessible Jira projects for these credentials.
   * GET /rest/api/3/project
   */
  async getProjects(creds: JiraCredentials): Promise<JiraProject[]> {
    const data = await this.jiraFetch<JiraProject[]>(
      creds,
      '/rest/api/3/project',
    );
    return data;
  }

  /**
   * Fetch User Stories for a given Jira project key using JQL.
   * GET /rest/api/3/search?jql=project=KEY AND issuetype=Story
   *
   * Handles Jira's 50-issue default page size with pagination.
   */
  async getStories(
    creds: JiraCredentials,
    jiraProjectKey: string,
  ): Promise<JiraIssue[]> {
    const jql = encodeURIComponent(
      `project="${jiraProjectKey}" AND issuetype=Story ORDER BY created DESC`,
    );

    const fields = encodeURIComponent(
      'summary,description,comment,customfield_10016',
    );

    // Paginate: Jira max 100 per page
    const PAGE_SIZE = 100;
    let startAt = 0;
    const allIssues: JiraIssue[] = [];

    do {
      const result = await this.jiraFetch<JiraIssueSearchResult>(
        creds,
        `/rest/api/3/search?jql=${jql}&fields=${fields}&maxResults=${PAGE_SIZE}&startAt=${startAt}`,
      );

      allIssues.push(...result.issues);
      startAt += result.issues.length;

      // Stop if we've retrieved all issues
      if (startAt >= result.total || result.issues.length === 0) break;
    } while (true);

    this.logger.log(
      `Fetched ${allIssues.length} stories from Jira project "${jiraProjectKey}"`,
    );

    return allIssues;
  }

  /**
   * Fetch a single Jira Issue by its key.
   * GET /rest/api/3/issue/:issueKey
   */
  async getIssue(
    creds: JiraCredentials,
    issueKey: string,
  ): Promise<JiraIssue> {
    const result = await this.jiraFetch<JiraIssue>(
      creds,
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}`,
    );
    return result;
  }

  /**
   * Validate credentials without fetching full data.
   * Uses /rest/api/3/myself — cheap call that returns 401 on bad creds.
   */
  async validateCredentials(creds: JiraCredentials): Promise<boolean> {
    await this.jiraFetch<unknown>(creds, '/rest/api/3/myself');
    return true;
  }
}

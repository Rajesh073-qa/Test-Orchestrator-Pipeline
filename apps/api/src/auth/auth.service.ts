import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';
import * as bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<{ message: string; userId: string }> {
    // 1. Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Hash password — NEVER store plain text
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    } catch (err) {
      this.logger.error('Failed to hash password', err);
      throw new InternalServerErrorException('Registration failed');
    }

    // 3. Persist user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
    });

    this.logger.log(`New user registered: ${user.email} [${user.role}]`);

    // 4. Return confirmation — NEVER return password
    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<{ accessToken: string; user: Omit<JwtPayload, never> }> {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Use a generic error — never reveal whether email exists
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password against bcrypt hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Build JWT payload — role comes from DB, never from client
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'QA' | 'VIEWER',
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.email} [${user.role}]`);

    // 4. Return token + safe user info — NEVER expose password
    return {
      accessToken,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role as 'ADMIN' | 'QA' | 'VIEWER',
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    // 1. Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // For security, always return success even if user doesn't exist
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return { message: 'If an account with this email exists, a password reset link has been sent.' };
    }

    // 2. In a real app, generate a reset token and send email
    // For this demo, just log it
    this.logger.log(`Password reset requested for: ${email}`);

    return { message: 'If an account with this email exists, a password reset link has been sent.' };
  }
}

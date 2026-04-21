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
        name: dto.name,
        password: hashedPassword,
        role: dto.role ?? 'USER',
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
    if (!user.password) {
      throw new UnauthorizedException('Please login with Google');
    }
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
  // GET PROFILE (used by /auth/me)
  // ─────────────────────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        // password is explicitly excluded via select
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GOOGLE AUTH
  // ─────────────────────────────────────────────────────────────────────────────
  async validateGoogleUser(googleUser: any) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
      },
    });

    if (user) {
      // If user exists but hasn't linked Google yet, link it
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.googleId },
        });
      }
    } else {
      // Create new user for Google signup
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          googleId: googleUser.googleId,
          password: '', // OAuth users don't have a password
        },
      });
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}

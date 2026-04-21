import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { TwoFactorService } from './two-factor.service';
import type { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generate2FA(@CurrentUser() user: JwtPayload) {
    return this.twoFactorService.generateSecret(user.userId);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@Body('token') token: string, @CurrentUser() user: JwtPayload) {
    const isValid = await this.twoFactorService.verifyToken(user.userId, token);
    return { success: isValid };
  }

  /**
   * POST /auth/register
   * Public — registers a new user with email, password, and role.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Public — authenticates the user and returns a signed JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/me
   * Protected — returns the profile of the currently authenticated user.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.userId);
  }

  /**
   * GET /auth/admin-only
   * Protected + Role-gated — only ADMIN can access.
   * Demonstrates @Roles usage; remove or adjust for real routes.
   */
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminOnly(@CurrentUser() user: JwtPayload) {
    return { message: `Hello Admin ${user.email}` };
  }

  // ── Google OAuth ──
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { accessToken } = await this.authService.validateGoogleUser(req.user);
    // Redirect to frontend with token — in production, use a more secure way or a cookie
    return res.redirect(`${process.env.FRONTEND_URL}/login?token=${accessToken}`);
  }
}

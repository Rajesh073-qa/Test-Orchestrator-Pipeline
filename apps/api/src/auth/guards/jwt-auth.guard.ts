import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects routes by requiring a valid JWT Bearer token.
 * Apply with @UseGuards(JwtAuthGuard) on controllers or individual routes.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access a route.
 * Usage: @Roles('ADMIN', 'QA')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

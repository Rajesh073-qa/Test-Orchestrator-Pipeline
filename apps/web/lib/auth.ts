/**
 * Auth utilities — decode JWT token from localStorage and expose user info.
 */

export interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'QA' | 'USER' | 'VIEWER';
  name?: string;
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]!));
    return {
      userId: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role || 'USER',
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getAuthUser()?.role === 'ADMIN';
}

export function isQA(): boolean {
  const role = getAuthUser()?.role;
  return role === 'QA' || role === 'ADMIN';
}

export function getUserInitials(user: AuthUser | null): string {
  if (!user) return '?';
  if (user.name) {
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return user.email.slice(0, 2).toUpperCase();
}

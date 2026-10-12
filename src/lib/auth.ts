import { User, Role } from '@/types';
import { MOCK_USERS } from './mockData';

const AUTH_STORAGE_KEY = 'campusfix_auth_user_v1';

export function getStoredAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!item) {
      // Default to Student Demo for easy demo access if not set
      return MOCK_USERS[0];
    }
    return JSON.parse(item);
  } catch {
    return MOCK_USERS[0];
  }
}

export function setStoredAuthUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to store auth user:', e);
  }
}

export function getDemoUserByRole(role: Role): User {
  const found = MOCK_USERS.find((u) => u.role === role);
  return (
    found || {
      id: 'demo-user',
      name: 'Demo User',
      email: `${role.toLowerCase()}@campus.edu`,
      role,
      phone: '+91 98765 43210',
      status: 'ACTIVE',
      joinedDate: '2025-01-01',
    }
  );
}

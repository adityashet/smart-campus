'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { getStoredAuthUser, setStoredAuthUser, getDemoUserByRole } from '@/lib/auth';
import { MOCK_USERS } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string, customName?: string) => Promise<User>;
  register: (userData: { name: string; email: string; phone: string; role: Role; department?: string }) => Promise<User>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const stored = getStoredAuthUser();
      setUser(stored);
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, _password?: string, customName?: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const lowerEmail = email.toLowerCase().trim();
    let found = MOCK_USERS.find((u) => u.email.toLowerCase() === lowerEmail);

    const resolvedName = customName?.trim() || (found ? found.name : email.split('@')[0]);

    if (found) {
      const isCustomName = Boolean(customName?.trim() && customName.trim() !== found.name);
      found = {
        ...found,
        name: resolvedName,
        avatarUrl: isCustomName ? undefined : found.avatarUrl,
      };
    } else {
      let role: Role = 'STUDENT';
      if (lowerEmail.includes('staff')) role = 'STAFF';
      if (lowerEmail.includes('admin')) role = 'ADMIN';

      found = {
        id: `u-${Date.now()}`,
        name: resolvedName,
        email: lowerEmail,
        role,
        phone: '+91 98765 00000',
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().split('T')[0],
      };
    }

    setUser(found);
    setStoredAuthUser(found);
    setIsLoading(false);
    return found;
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    role: Role;
    department?: string;
  }): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const newUser: User = {
      id: `u-reg-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      department: userData.department || (userData.role === 'STUDENT' ? 'General Student' : 'General Staff'),
      status: 'ACTIVE',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUser(newUser);
    setStoredAuthUser(newUser);
    setIsLoading(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setStoredAuthUser(null);
  };

  const switchRole = (role: Role) => {
    const demoUser = getDemoUserByRole(role);
    setUser(demoUser);
    setStoredAuthUser(demoUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

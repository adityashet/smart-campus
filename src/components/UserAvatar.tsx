import React from 'react';
import { User } from '@/types';

interface UserAvatarProps {
  user?: Partial<User> | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showRoleBadge?: boolean;
}

export function UserAvatar({ user, name, size = 'md', showRoleBadge = false }: UserAvatarProps) {
  const displayName = name || user?.name || 'User';
  const role = user?.role || 'STUDENT';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses =
    size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base font-bold' : 'w-10 h-10 text-sm font-semibold';

  const getRoleBg = () => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-600 text-white';
      case 'STAFF':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="relative inline-block">
      {user?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt={displayName}
          className={`${sizeClasses} rounded-full object-cover ring-2 ring-slate-100 shadow-2xs`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center ${getRoleBg()} ring-2 ring-slate-100 shadow-2xs`}
        >
          {initials}
        </div>
      )}
      {showRoleBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full ring-2 ring-white ${
            role === 'ADMIN' ? 'bg-purple-500' : role === 'STAFF' ? 'bg-blue-500' : 'bg-emerald-500'
          }`}
          title={role}
        />
      )}
    </div>
  );
}

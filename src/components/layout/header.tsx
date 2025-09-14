'use client';

import Link from 'next/link';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import { useAuth } from '@/context/AuthProvider';
import type { Tables } from '@/lib/database.types';

export function AppHeader() {
  const { user, profile } = useAuth();
  const typedProfile = profile as Tables<'profiles'> | null;

  if (!user || !typedProfile) {
    // Or a loading spinner
    return null;
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href={typedProfile.role === 'admin' ? '/admin' : '/dashboard'}
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-primary"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="sr-only">Givanas Nigeria LTD</span>
        </Link>
      </nav>
      
      <MobileSidebar userRole={typedProfile.role} />

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Future search bar can go here */}
        </div>
        <UserNav user={user} profile={typedProfile} />
      </div>
    </header>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ADMIN_NAV_LINKS, USER_NAV_LINKS } from '@/lib/constants';
import { AppSidebarNav } from './sidebar-nav';
import { useAuth } from '@/context/AuthProvider';
import { Skeleton } from '../ui/skeleton';

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: AppSidebarProps) {
  const { profile } = useAuth();

  if (!profile) {
    return (
       <div className={cn('hidden border-r bg-muted/40 md:block', className)}>
         <div className="flex h-full max-h-screen flex-col gap-2 p-4">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
         </div>
       </div>
    );
  }

  const navLinks = (profile.role === 'admin' ? ADMIN_NAV_LINKS : USER_NAV_LINKS)
    .filter(link => !link.roles || link.roles.includes(profile.role));

  return (
    <div
      className={cn(
        'hidden border-r bg-muted/40 md:block',
        className
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1">
          <ScrollArea className="h-full">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              <AppSidebarNav links={navLinks} />
            </nav>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

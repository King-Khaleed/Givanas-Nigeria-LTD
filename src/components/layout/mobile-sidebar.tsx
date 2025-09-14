
'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AppSidebarNav } from './sidebar-nav';
import { ADMIN_NAV_LINKS, USER_NAV_LINKS } from '@/lib/constants';

interface MobileSidebarProps {
  userRole: 'admin' | 'staff' | 'client';
}

export function MobileSidebar({ userRole }: MobileSidebarProps) {
  const navLinks = (userRole === 'admin' ? ADMIN_NAV_LINKS : USER_NAV_LINKS)
    .filter(link => !link.roles || link.roles.includes(userRole));
  const homeHref = userRole === 'admin' ? '/admin' : '/dashboard';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href={homeHref}
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span className="text-xl font-bold tracking-tight">Givanas Nigeria LTD</span>
          </Link>
          <AppSidebarNav links={navLinks} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

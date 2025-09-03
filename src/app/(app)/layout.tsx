
'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MainHeader } from "@/components/main-header";
import { useAuth } from "@/hooks/use-auth-context";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }

    if (!loading && user && profile) {
        // This logic handles cases where a logged-in user with a specific role
        // tries to access a dashboard they shouldn't. It will redirect them
        // to their correct dashboard.
        const isAdmin = profile.role === 'admin';
        const isStaff = profile.role === 'staff';
        const isClient = profile.role === 'client';

        if (pathname.startsWith('/admin') && !isAdmin) {
            redirect('/dashboard');
        }
        if (pathname.startsWith('/dashboard/staff') && !isStaff) {
            redirect('/dashboard');
        }
        if (pathname.startsWith('/dashboard/client') && !isClient) {
            redirect('/dashboard');
        }
        
        // Redirect from generic dashboard to role-specific one
        if (pathname === '/dashboard') {
            if (isAdmin) redirect('/admin');
            if (isStaff) redirect('/dashboard/staff');
            if (isClient) redirect('/dashboard/client');
        }
    }
  }, [user, profile, loading, pathname]);

  if (loading || !profile) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-h-screen">
        <MainHeader profile={profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">{children}</main>
      </div>
    </SidebarProvider>
  );
}

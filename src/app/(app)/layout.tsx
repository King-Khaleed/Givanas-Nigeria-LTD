
'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MainHeader } from "@/components/main-header";
import { useAuth } from "@/hooks/use-auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait for the auth state to be determined

    // If there's no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Role-based redirect logic
    const isAdmin = profile?.role === 'admin';
    const isStaff = profile?.role === 'staff';
    const isClient = profile?.role === 'client';

    // If a user is on a page they shouldn't be, redirect them to their home.
    if (pathname.startsWith('/admin') && !isAdmin) router.push('/dashboard');
    if (pathname.startsWith('/dashboard/staff') && !isStaff) router.push('/dashboard');
    if (pathname.startsWith('/dashboard/client') && !isClient) router.push('/dashboard');
    
    // Redirect from the generic /dashboard to the correct role-specific dashboard
    if (pathname === '/dashboard') {
        if (isAdmin) router.push('/admin');
        else if (isStaff) router.push('/dashboard/staff');
        else if (isClient) router.push('/dashboard/client');
    }
    
  }, [user, profile, loading, pathname, router]);

  // While loading, show a spinner. This prevents the "flash" of the login page.
  if (loading || !profile || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  // Once loaded and authenticated, render the main app layout.
  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-h-screen">
        <MainHeader profile={profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30">{children}</main>
      </div>
    </SidebarProvider>
  );
}

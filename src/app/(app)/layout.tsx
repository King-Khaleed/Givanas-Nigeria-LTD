"use client";

import { useAuth } from "@/hooks/use-auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Do not perform any logic while the session is still loading.
        if (loading) {
            return;
        }

        // After loading, if there's definitively no user, redirect to login.
        if (!user) {
            router.push("/login");
            return;
        }

        // If a user and profile exist, check for role-based access.
        if (profile) {
            if (pathname.startsWith('/admin') && profile.role !== 'admin') {
                router.push('/dashboard');
            }
        }
    }, [user, profile, loading, router, pathname]);

    // Show a loading spinner while the auth state is being determined.
    // This prevents rendering the children or redirecting prematurely.
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }
    
    // Only render the main layout if we are done loading and have a user profile.
    if (profile && user) {
        return (
            <SidebarProvider>
                <AppSidebar profile={profile} />
                <div className="flex-1 flex flex-col">
                    <MainHeader profile={profile} />
                    <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900/50">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        );
    }

    // Fallback loading state for edge cases while waiting for redirect.
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
}


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
        if (loading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        if (profile) {
            if (pathname.startsWith('/admin') && profile.role !== 'admin') {
                router.push('/dashboard');
            }
        }
    }, [user, profile, loading, router, pathname]);

    if (loading || !profile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }
    
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

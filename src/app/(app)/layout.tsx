
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";
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
        if (loading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        if (profile?.role === 'admin' && !pathname.startsWith('/admin')) {
             router.push('/admin');
        } else if (profile?.role === 'staff' && !pathname.startsWith('/dashboard/staff') && pathname !== '/dashboard') {
             // Let staff see main dashboard for now
        } else if (profile?.role === 'client' && !pathname.startsWith('/dashboard/client') && pathname !== '/dashboard') {
             // Let clients see main dashboard for now
        }

    }, [user, profile, loading, pathname, router]);

    if (loading || !profile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
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

    
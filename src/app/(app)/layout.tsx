
'use client';

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
    const auth = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (auth.loading) return;

        if (!auth.user) {
            return router.push('/login');
        }

        // Role-based redirects
        if (auth.profile?.role === 'admin' && !pathname.startsWith('/admin')) {
             router.push('/admin');
        } else if (auth.profile?.role === 'staff' && !pathname.startsWith('/dashboard/staff')) {
             router.push('/dashboard/staff');
        } else if (auth.profile?.role === 'client' && !pathname.startsWith('/dashboard/client')) {
             router.push('/dashboard/client');
        }

    }, [auth.loading, auth.user, auth.profile, pathname, router]);

    if (auth.loading || !auth.profile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <AppSidebar profile={auth.profile} />
            <div className="flex flex-col flex-1">
                <MainHeader profile={auth.profile} />
                <main className="flex-1 p-4 sm:p-6 bg-secondary/30">
                    {children}
                </main>
            </div>
        </div>
    );
}

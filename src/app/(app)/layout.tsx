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
        console.log("DEBUG LAYOUT STATE:", {
            loading,
            user,
            profile,
            pathname,
        });

        // Do not perform any logic while the session is still loading.
        if (loading) {
            console.log("STATUS: Still loading → hold off on redirects");
            return;
        }

        // After loading, if there's definitively no user, redirect to login.
        if (!user) {
            console.log("STATUS: No user after loading → redirecting to /login");
            router.push("/login");
            return;
        }

        // If a user and profile exist, check for role-based access.
        if (profile) {
            if (pathname.startsWith("/admin") && profile.role !== "admin") {
                console.log(
                    `STATUS: Role mismatch (${profile.role}) → redirecting to /dashboard`
                );
                router.push("/dashboard");
            } else {
                console.log("STATUS: User + profile valid → staying on current page");
            }
        } else {
            console.log("STATUS: User exists but profile is null/undefined");
        }
    }, [user, profile, loading, router, pathname]);

    // Show a loading spinner while the auth state is being determined.
    if (loading) {
        console.log("RENDER: Showing spinner while loading === true");
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Only render the main layout if we are done loading and have a user profile.
    if (profile && user) {
        console.log("RENDER: Rendering layout with sidebar + header");
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

    console.log("RENDER: Fallback spinner (no profile yet, but not loading)");
    // Fallback loading state for edge cases while waiting for redirect.
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
}

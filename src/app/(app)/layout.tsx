
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Dummy profile for layout rendering without auth
    const mockProfile = {
        id: 'mock-user',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'admin' as const,
        organization_id: 'mock-org',
        phone: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    
    return (
        <SidebarProvider>
            <AppSidebar profile={mockProfile} />
            <div className="flex-1 flex flex-col">
                <MainHeader profile={mockProfile} />
                <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900/50">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}

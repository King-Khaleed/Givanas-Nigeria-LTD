
import { AppSidebar } from "@/components/app-sidebar";
import { MainHeader } from "@/components/main-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <SidebarProvider>
            <AppSidebar profile={profile} />
            <div className="flex-1 flex flex-col">
                <MainHeader profile={profile} />
                <main className="flex-1 p-6 bg-secondary/20">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}

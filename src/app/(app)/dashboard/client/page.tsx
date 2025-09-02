
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ClientDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Client Dashboard</h1>
                <p className="text-muted-foreground">Welcome, client user {user?.email}!</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>A list of your submitted records would be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}

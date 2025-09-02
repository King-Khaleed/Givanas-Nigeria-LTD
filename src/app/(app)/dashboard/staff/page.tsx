
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function StaffDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Staff Dashboard</h1>
                <p className="text-muted-foreground">Welcome, staff member {user?.email}!</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>A list of tasks for the staff member would be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}

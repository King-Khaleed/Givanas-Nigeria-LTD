
import {
  Building,
  CheckCircle,
  DollarSign,
  FileText,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { OrganizationsTable } from "./_components/organizations-table";
import { AddOrganizationButton } from "./_components/add-organization-button";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationsPage() {
  const supabase = createClient();
  const { data: orgs, error } = await supabase.from('organizations').select('*, profiles(count), financial_records(count)');
  
  if (error) {
    console.error('Error fetching organizations:', error);
  }

  const stats = {
    total: orgs?.length ?? 0,
    active: orgs?.filter(o => o.status === 'active').length ?? 0,
    revenue: orgs?.reduce((acc, o) => acc + (o.monthly_revenue ?? 0), 0) ?? 0,
    avgFiles: (orgs?.reduce((acc, o) => acc + (o.financial_records[0]?.count ?? 0), 0) ?? 0) / (orgs?.length || 1),
  };

  const statsCards = [
    { title: "Total Organizations", value: stats.total, change: "+7 this month", icon: Building },
    { title: "Active Organizations", value: stats.active, change: `${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}% of total`, icon: CheckCircle },
    { title: "Monthly Revenue", value: `$${stats.revenue.toLocaleString()}`, change: "+12% last month", icon: DollarSign },
    { title: "Avg. Files / Org", value: stats.avgFiles.toFixed(0), change: "+23 this month", icon: FileText },
  ];

  const tableOrgs = orgs?.map(org => ({
      id: org.id,
      name: org.name,
      industry: org.industry ?? 'N/A',
      admin: 'N/A', // This needs a proper join or separate query
      users: org.profiles[0]?.count ?? 0,
      files: org.financial_records[0]?.count ?? 0,
      lastActivity: 'N/A', // This needs to be tracked
      status: org.status as any,
      plan: org.plan as any,
  })) ?? [];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Organization Management</h1>
          <p className="text-muted-foreground">
            Manage all organizations on the platform and their settings.
          </p>
        </div>
        <AddOrganizationButton />
      </div>

       {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(card => (
            <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-green-600">{card.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>


      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <Input placeholder="Search organizations..." />
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="gap-1">
                            Status: All <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuCheckboxItem checked>All</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Active</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Inactive</DropdownMenuCheckboxItem>
                         <DropdownMenuCheckboxItem>Trial</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Suspended</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="gap-1">
                            Plan: All <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuCheckboxItem checked>All</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Enterprise</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Professional</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Basic</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Free Trial</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost">Clear Filters</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
           <OrganizationsTable organizations={tableOrgs} />
        </CardContent>
      </Card>
    </div>
  );
}

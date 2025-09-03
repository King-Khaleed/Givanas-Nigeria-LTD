
import {
  Building,
  CheckCircle,
  DollarSign,
  FileText,
  PlusCircle,
  Filter,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { OrganizationsTable } from "./_components/organizations-table";
import { AddOrganizationButton } from "./_components/add-organization-button";

const statsCards = [
  { title: "Total Organizations", value: "89", change: "+7 this month", icon: Building },
  { title: "Active Organizations", value: "82", change: "92% of total", icon: CheckCircle },
  { title: "Monthly Revenue", value: "$127,450", change: "+12% last month", icon: DollarSign },
  { title: "Avg. Files / Org", value: "156", change: "+23 this month", icon: FileText },
];

const mockOrgs = [
    { id: '1', name: 'Innovate LLC', industry: 'Technology', admin: 'john@innovate.com', users: 52, files: 1250, lastActivity: '2h ago', status: 'active', plan: 'professional' },
    { id: '2', name: 'HealthFirst Partners', industry: 'Healthcare', admin: 'sarah@healthfirst.com', users: 150, files: 8734, lastActivity: '1d ago', status: 'active', plan: 'enterprise' },
    { id: '3', name: 'Finance Pro', industry: 'Finance', admin: 'mike@financepro.com', users: 25, files: 450, lastActivity: '5h ago', status: 'trial', plan: 'free' },
    { id: '4', name: 'Manufacture Corp', industry: 'Manufacturing', admin: 'dave@mcorp.com', users: 300, files: 15200, lastActivity: '3d ago', status: 'inactive', plan: 'professional' },
    { id: '5', name: 'Retail Solutions', industry: 'Retail', admin: 'emily@retailsol.com', users: 80, files: 2300, lastActivity: '1w ago', status: 'suspended', plan: 'basic' },
    { id: '6', name: 'TechStart Inc.', industry: 'Technology', admin: 'lisa@techstart.com', users: 15, files: 320, lastActivity: '2d ago', status: 'active', plan: 'basic' },
    { id: '7', name: 'Global Finance', industry: 'Finance', admin: 'peter@globalfin.com', users: 500, files: 25000, lastActivity: '6h ago', status: 'active', plan: 'enterprise' },
    { id: '8', name: 'Carewell Clinic', industry: 'Healthcare', admin: 'susan@carewell.com', users: 45, files: 3400, lastActivity: '5d ago', status: 'inactive', plan: 'professional' },
    { id: '9', name: 'AutoParts Direct', industry: 'Manufacturing', admin: 'brian@autoparts.com', users: 120, files: 6800, lastActivity: '4h ago', status: 'active', plan: 'professional' },
    { id: '10', name: 'Fashion Forward', industry: 'Retail', admin: 'olivia@fashionfwd.com', users: 35, files: 980, lastActivity: '1d ago', status: 'trial', plan: 'free' },
];


export default function OrganizationsPage() {
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
           <OrganizationsTable organizations={mockOrgs} />
        </CardContent>
      </Card>
    </div>
  );
}

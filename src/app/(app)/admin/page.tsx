
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Building, 
    Users, 
    FileText, 
    Activity, 
    Plus, 
    UserPlus, 
    Download, 
    TrendingUp,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

const statsCards = [
    { title: "Total Organizations", value: "156", change: "+12%", icon: Building },
    { title: "Active Users", value: "2,847", change: "+8%", icon: Users },
    { title: "Reports Generated", value: "1,234", change: "+15%", icon: FileText },
]

const activities = [
    { name: "John Smith", avatar: "/avatars/01.png", action: "uploaded financial records", org: "Acme Corp", time: "2m ago", status: "Completed" },
    { name: "Sarah Johnson", avatar: "/avatars/02.png", action: "generated audit report", org: "TechStart Inc", time: "5m ago", status: "Processing" },
    { name: "Admin Mike", avatar: "/avatars/03.png", action: "approved new user", org: "Global Finance", time: "10m ago", status: "Completed" },
    { name: "Emily White", avatar: "/avatars/04.png", action: "flagged a transaction", org: "Innovate LLC", time: "1h ago", status: "Completed" },
    { name: "David Brown", avatar: "/avatars/05.png", action: "failed to upload", org: "Data Systems", time: "2h ago", status: "Failed" },
     { name: "John Smith", avatar: "/avatars/01.png", action: "uploaded financial records", org: "Acme Corp", time: "2m ago", status: "Completed" },
    { name: "Sarah Johnson", avatar: "/avatars/02.png", action: "generated audit report", org: "TechStart Inc", time: "5m ago", status: "Processing" },
    { name: "Admin Mike", avatar: "/avatars/03.png", action: "approved new user", org: "Global Finance", time: "10m ago", status: "Completed" },
    { name: "Emily White", avatar: "/avatars/04.png", action: "flagged a transaction", org: "Innovate LLC", time: "1h ago", status: "Completed" },
    { name: "David Brown", avatar: "/avatars/05.png", action: "failed to upload", org: "Data Systems", time: "2h ago", status: "Failed" },
];

const quickActions = [
    { label: "Add New Organization", icon: Plus, variant: "default" as const },
    { label: "Invite Users", icon: UserPlus, variant: "outline" as const },
    { label: "Generate System Report", icon: Download, variant: "outline" as const },
    { label: "View Platform Analytics", icon: TrendingUp, variant: "outline" as const },
]

const systemStatus = [
    { service: "Database", status: "Online", color: "bg-green-500" },
    { service: "File Storage", status: "Online", color: "bg-green-500" },
    { service: "Analysis Engine", status: "Processing 3 files", color: "bg-orange-500" },
    { service: "Email Service", status: "Online", color: "bg-green-500" },
]


export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Section 1: Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(card => (
            <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-green-600">{card.change} from last month</p>
                </CardContent>
            </Card>
        ))}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    Excellent
                </div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
        </Card>
      </div>

      {/* Section 2: Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2">
           <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Recent Platform Activities</CardTitle>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="#">
                        View All
                        <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="hidden md:table-cell">Action</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead className="hidden md:table-cell">Time</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={activity.avatar} />
                                                <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{activity.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{activity.action}</TableCell>
                                    <TableCell>{activity.org}</TableCell>
                                    <TableCell className="hidden md:table-cell">{activity.time}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge 
                                            variant={
                                                activity.status === "Completed" ? "default" :
                                                activity.status === "Processing" ? "secondary" : "destructive"
                                            }
                                            className="capitalize"
                                        >
                                            {activity.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {quickActions.map(action => (
                        <Button key={action.label} variant={action.variant} className="w-full justify-start h-12 text-base">
                            <action.icon className="mr-2 h-4 w-4" />
                            {action.label}
                        </Button>
                    ))}
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {systemStatus.map(system => (
                         <div key={system.service} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{system.service}</span>
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${system.color}`}></span>
                                <span className="text-sm font-medium">{system.status}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

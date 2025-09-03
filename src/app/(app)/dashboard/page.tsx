
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileCheck2, AlertTriangle, FileText, Activity, Download, Eye, Share2, MoreVertical, Search, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statsCards = [
    { 
        title: "Files Processed", 
        value: "47", 
        sublabel: "This month", 
        icon: FileCheck2, 
        progress: 75,
        color: "green"
    },
    { 
        title: "High-Risk Items", 
        value: "8", 
        sublabel: "Requires attention", 
        icon: AlertTriangle, 
        color: "red"
    },
    { 
        title: "Reports Generated", 
        value: "12", 
        sublabel: "Ready for download", 
        change: "+3 this week",
        icon: FileText,
        color: "blue"
    },
]

const recentUploads = [
    { name: "Q3_Financials.pdf", size: "2.1 MB", time: "5m ago", status: "Uploaded" },
    { name: "Expense_Report.xlsx", size: "850 KB", time: "1h ago", status: "Uploaded" },
    { name: "Receipts_Sept.zip", size: "12.4 MB", time: "3h ago", status: "Uploaded" },
]

const recentAnalysis = [
    { name: "Invoice_March2025.pdf", risk: "low", status: "Completed", date: "2 hours ago" },
    { name: "Payroll_Q3.csv", risk: "high", status: "Completed", date: "8 hours ago" },
    { name: "Vendor_Contracts.docx", risk: "medium", status: "Completed", date: "Yesterday" },
    { name: "Client_Onboarding.pdf", risk: null, status: "Processing", date: "Today" },
    { name: "Annual_Report_Draft.pdf", risk: null, status: "Failed", date: "2 days ago" },
]

const recentReports = [
    { name: "Q3 Financial Summary", type: "Executive Summary", date: "3 hours ago", size: "1.2 MB" },
    { name: "Risk Assessment Q3", type: "Detailed Analysis", date: "Yesterday", size: "5.8 MB" },
    { name: "Compliance Review", type: "Compliance Report", date: "2 days ago", size: "2.3 MB" },
    { name: "Full Audit Trail", type: "Full Audit", date: "4 days ago", size: "15.2 MB" },
]

const activityFeed = [
    { user: "You", avatar: "/avatars/01.png", action: "uploaded", target: "Q3_Financials.pdf", time: "5m ago", icon: UploadCloud },
    { user: "System", avatar: null, action: "completed analysis for", target: "Payroll_Q2.csv", time: "25m ago", icon: FileCheck2 },
    { user: "You", avatar: "/avatars/01.png", action: "generated", target: "Q3 Financial Summary", time: "3h ago", icon: FileText },
    { user: "Sarah Johnson", avatar: "/avatars/02.png", action: "uploaded", target: "Vendor_Contracts.docx", time: "1d ago", icon: UploadCloud },
    { user: "System", avatar: null, action: "flagged 3 high-risk items in", target: "Transaction_Log.csv", time: "1d ago", icon: AlertTriangle },
]

export default async function Dashboard() {
  const getRiskBadge = (risk: string | null) => {
    switch(risk) {
      case 'low': return <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high': return <Badge variant="destructive">High</Badge>;
      default: return <Badge variant="outline">N/A</Badge>;
    }
  }

  const getStatusBadge = (status: string) => {
     switch(status) {
      case 'Completed': return <Badge variant="secondary" className="bg-green-100 text-green-800">{status}</Badge>;
      case 'Processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{status}</Badge>;
      case 'Failed': return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
        {/* Section 1: Welcome */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <h1 className="text-2xl font-bold">Good morning, Staff!</h1>
            <p className="text-sm opacity-80">Here&apos;s what&apos;s happening with your financial records today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
        </div>

        {/* Section 2: Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statsCards.map((card, index) => (
                <Card key={index} className={`border-l-4 border-${card.color}-500`}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{card.sublabel}</p>
                        </div>
                        <card.icon className={`h-5 w-5 text-muted-foreground text-${card.color}-500`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        {card.progress && <Progress value={card.progress} className="h-2 mt-2" />}
                        {card.change && <p className="text-xs text-green-600 mt-2">{card.change}</p>}
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Section 3: Main Action Area */}
        <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5" /> Upload Financial Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                        <UploadCloud className="w-12 h-12 text-muted-foreground" />
                        <p className="mt-4 font-semibold">Drag and drop your files here</p>
                        <p className="text-sm text-muted-foreground">or click to browse files</p>
                        <p className="text-xs text-muted-foreground mt-2">PDF, Excel, CSV, Images - Max 50MB each</p>
                    </div>
                     <Button className="w-full mt-4">Browse Files</Button>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Analysis Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                     <div className="relative h-32 w-32">
                        <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2"></circle>
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-primary" strokeWidth="2" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round"></circle>
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold">75%</div>
                    </div>
                    <div className="w-full space-y-2 text-sm">
                        <div className="flex justify-between"><span>3 files in queue</span> <Loader2 className="h-4 w-4 animate-spin"/></div>
                        <div className="flex justify-between"><span>2 files completed</span> <CheckCircle className="h-4 w-4 text-green-500"/></div>
                        <div className="flex justify-between"><span>0 files failed</span> <XCircle className="h-4 w-4 text-red-500"/></div>
                    </div>
                    <Button variant="outline" className="w-full">View All Results</Button>
                </CardContent>
            </Card>
        </div>

        {/* Section 4: Data Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center">
                    <CardTitle>Recent Analysis</CardTitle>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/dashboard/records">View All <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Risk</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentAnalysis.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{getRiskBadge(item.risk)}</TableCell>
                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                                    <TableCell className="flex gap-1">
                                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center">
                    <CardTitle>Recent Reports</CardTitle>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/dashboard/reports">View All <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {recentReports.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell className="flex gap-1">
                                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon"><Share2 className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        {/* Section 5: Activity Feed */}
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activityFeed.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={item.avatar} />
                                <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <p className="text-sm">
                                    <span className="font-semibold">{item.user}</span>
                                    {` ${item.action} `}
                                    <span className="font-semibold text-primary">{item.target}</span>
                                </p>
                            </div>
                            <div className="text-xs text-muted-foreground">{item.time}</div>
                        </div>
                    ))}
                </div>
                 <Button variant="outline" className="w-full mt-4">Load More</Button>
            </CardContent>
        </Card>

         {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3">
             <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                <UploadCloud className="h-6 w-6" />
                <span className="sr-only">Upload Files</span>
            </Button>
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg">
                <FileText className="h-5 w-5" />
                 <span className="sr-only">Generate Report</span>
            </Button>
        </div>
    </div>
  );
}

    
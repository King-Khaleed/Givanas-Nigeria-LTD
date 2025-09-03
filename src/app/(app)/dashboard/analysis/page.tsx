
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Download,
    FileSearch,
    Filter,
    Shield,
    TrendingUp,
    AlertTriangle,
    Search,
    ChevronDown,
} from "lucide-react";
import { AnalysisCharts } from "./_components/charts";
import { FindingsTable } from "./_components/findings-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";


const statsCards = [
    { title: "Total Findings", value: "47", change: "23 new, 24 reviewed", icon: TrendingUp },
    { title: "High-Risk Items", value: "8", change: "Requires immediate attention", icon: AlertTriangle, color: "text-red-500" },
    { title: "Compliance Score", value: "92%", change: "+5% from last month", icon: Shield },
    { title: "Files Analyzed", value: "156", change: "This month", icon: FileSearch },
];

const mockFindings = [
  { id: "uuid1", riskLevel: "high", findingType: "Compliance Issue", fileName: "Invoice_March2025.pdf", description: "Missing approval signature on high-value transaction.", dateFound: "2025-03-01T14:30:00Z", status: "new" },
  { id: "uuid2", riskLevel: "medium", findingType: "Data Anomaly", fileName: "Q1_Financial_Data.xlsx", description: "Unusual payment amount to a new vendor.", dateFound: "2025-03-01T12:00:00Z", status: "new" },
  { id: "uuid3", riskLevel: "low", findingType: "Data Quality", fileName: "Transaction_Log_Sept.csv", description: "Inconsistent date formatting in transaction log.", dateFound: "2025-02-28T10:00:00Z", status: "under_review" },
  { id: "uuid4", riskLevel: "high", findingType: "Missing Document", fileName: "Vendor_Contracts.zip", description: "Required W-9 form for 'Innovate LLC' is missing.", dateFound: "2025-02-27T18:00:00Z", status: "resolved" },
  { id: "uuid5", riskLevel: "medium", findingType: "Duplicate Transaction", fileName: "Client_Payments.csv", description: "Potential duplicate payment detected for invoice #INV-7890.", dateFound: "2025-02-26T11:45:00Z", status: "new" },
  { id: "uuid6", riskLevel: "low", findingType: "Data Quality", fileName: "Employee_Expenses.xlsx", description: "Optional 'Project Code' field has 25% null values.", dateFound: "2025-02-25T09:20:00Z", status: "ignored" },
  { id: "uuid7", riskLevel: "high", findingType: "Compliance Issue", fileName: "Payroll_Q4_2024.pdf", description: "Overtime calculation does not match state regulations.", dateFound: "2025-02-24T15:00:00Z", status: "new" },
  { id: "uuid8", riskLevel: "medium", findingType: "Data Anomaly", fileName: "Vendor_Payments.csv", description: "Payment made on a weekend to a vendor with no weekend service agreement.", dateFound: "2025-02-23T13:10:00Z", status: "under_review" },
  { id: "uuid9", riskLevel: "low", findingType: "Compliance Issue", fileName: "Invoice_Oct2024.pdf", description: "PO number format inconsistent with company policy.", dateFound: "2025-02-22T16:55:00Z", status: "resolved" },
  { id: "uuid10", riskLevel: "medium", findingType: "Missing Document", fileName: "Client_Onboarding_Pack.zip", description: "Missing signed service agreement for 'Tech Solutions Inc'.", dateFound: "2025-02-21T08:30:00Z", status: "new" },
];


export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Analysis Results</h1>
          <p className="text-muted-foreground">
            View detailed analysis findings and risk assessments for your financial records.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Analysis Report
        </Button>
      </div>
      
       {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(card => (
            <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className={`h-4 w-4 text-muted-foreground ${card.color}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>

       {/* Charts Section */}
       <AnalysisCharts />

       {/* Detailed Findings Table */}
       <Card>
         <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search findings..." className="pl-8" />
                    </div>
                </div>
                 <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All Risks</TabsTrigger>
                        <TabsTrigger value="high">High <Badge className="ml-2 bg-red-100 text-red-800">8</Badge></TabsTrigger>
                        <TabsTrigger value="medium">Medium <Badge className="ml-2 bg-orange-100 text-orange-800">15</Badge></TabsTrigger>
                        <TabsTrigger value="low">Low <Badge className="ml-2 bg-green-100 text-green-800">24</Badge></TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="gap-1">
                            Status: All <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuCheckboxItem checked>All</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>New</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Under Review</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Resolved</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Ignored</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost">Clear Filters</Button>
                </div>
            </div>
         </CardHeader>
         <CardContent>
            <FindingsTable findings={mockFindings} />
         </CardContent>
       </Card>
    </div>
  );
}

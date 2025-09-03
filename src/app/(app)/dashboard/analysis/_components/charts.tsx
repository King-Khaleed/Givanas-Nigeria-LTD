
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DonutChart, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const riskDistributionData = [
    { name: 'High Risk', value: 8, fill: 'hsl(var(--destructive))' },
    { name: 'Medium Risk', value: 15, fill: 'hsl(var(--chart-2))' },
    { name: 'Low Risk', value: 24, fill: 'hsl(var(--chart-1))' },
];

const timelineData = [
  { date: '08-01', High: 0, Medium: 1, Low: 2 },
  { date: '08-02', High: 1, Medium: 2, Low: 3 },
  { date: '08-03', High: 0, Medium: 1, Low: 1 },
  { date: '08-04', High: 2, Medium: 0, Low: 2 },
  { date: '08-05', High: 1, Medium: 3, Low: 1 },
  { date: '08-06', High: 0, Medium: 2, Low: 4 },
  { date: '08-07', High: 3, Medium: 1, Low: 2 },
];


export function AnalysisCharts() {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Risk Level Distribution</CardTitle>
                    <CardDescription>Breakdown of all identified findings by risk level.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ChartContainer config={{}}>
                        <DonutChart>
                             <ChartTooltip
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie data={riskDistributionData} dataKey="value" nameKey="name" innerRadius={80}>
                            </Pie>
                        </DonutChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Activity Timeline</CardTitle>
                     <CardDescription>Number of findings discovered over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ChartContainer config={{}}>
                        <LineChart data={timelineData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="High" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Medium" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false}/>
                            <Line type="monotone" dataKey="Low" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false}/>
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}

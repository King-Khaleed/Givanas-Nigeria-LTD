
"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts"
import { ChartTooltipContent, ChartLegendContent, ChartContainer, ChartConfig } from "@/components/ui/chart"

interface StatusPieChartProps {
  data: any[]
}

const chartConfig = {
  Completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
  Pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
  Failed: {
    label: "Failed",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function StatusPieChart({ data }: StatusPieChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No analysis data available.
            </div>
        )
    }

  return (
    <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full w-full"
      >
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={100}
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return (
              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltipContent
            contentStyle={{
                borderRadius: "var(--radius)",
                border: "1px solid hsl(var(--border))",
            }}
            />
        <Legend content={<ChartLegendContent nameKey="status"/>} />
      </PieChart>
    </ChartContainer>
  )
}

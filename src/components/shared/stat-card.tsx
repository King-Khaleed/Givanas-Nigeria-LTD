import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  valueClassName?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  description,
  change,
  changeType,
  valueClassName,
}: StatCardProps) {
  const ChangeIcon = changeType === 'increase' ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
            {change && changeType && (
                <div className={cn("flex items-center gap-1", changeType === 'increase' ? 'text-green-600' : 'text-destructive')}>
                    <ChangeIcon className="h-4 w-4" />
                    {change}
                </div>
            )}
            {description && <p className="ml-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

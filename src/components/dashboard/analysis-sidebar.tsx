
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { DateRange } from 'react-day-picker';
import { addDays, format, isValid, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parseDateParam = (param: string | null) => {
    if (!param) return undefined;
    const date = parseISO(param);
    return isValid(date) ? date : undefined;
  };
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: parseDateParam(searchParams.get('from')) ?? addDays(new Date(), -30),
    to: parseDateParam(searchParams.get('to')) ?? new Date(),
  });
  
  const [riskLevel, setRiskLevel] = useState(searchParams.get('risk') || 'all');
  
  const initialTypes = searchParams.get('types')?.split(',') || [];
  const [recordTypes, setRecordTypes] = useState({
      PDF: initialTypes.includes('PDF'),
      Excel: initialTypes.includes('Excel'),
      CSV: initialTypes.includes('CSV'),
  });

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (date?.from) {
      params.set('from', date.from.toISOString());
    }
    if (date?.to) {
      params.set('to', date.to.toISOString());
    }
    if (riskLevel !== 'all') {
      params.set('risk', riskLevel);
    }

    const selectedTypes = Object.entries(recordTypes)
        .filter(([, isSelected]) => isSelected)
        .map(([type]) => type);
    
    if (selectedTypes.length > 0) {
        params.set('types', selectedTypes.join(','));
    }

    router.push(`/dashboard/analysis?${params.toString()}`);
  };

  const handleTypeChange = (type: keyof typeof recordTypes, checked: boolean) => {
    setRecordTypes(prev => ({ ...prev, [type]: checked }));
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date-range">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="risk-level">Risk Level</Label>
          <Select value={riskLevel} onValueChange={setRiskLevel}>
            <SelectTrigger id="risk-level">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Record Type</Label>
          <div className="space-y-2">
             <div className="flex items-center space-x-2">
                <Checkbox id="type-pdf" checked={recordTypes.PDF} onCheckedChange={(checked) => handleTypeChange('PDF', !!checked)} />
                <label htmlFor="type-pdf" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    PDF
                </label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="type-excel" checked={recordTypes.Excel} onCheckedChange={(checked) => handleTypeChange('Excel', !!checked)} />
                <label htmlFor="type-excel" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Excel
                </label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="type-csv" checked={recordTypes.CSV} onCheckedChange={(checked) => handleTypeChange('CSV', !!checked)} />
                <label htmlFor="type-csv" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    CSV
                </label>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
      </CardContent>
    </Card>
  );
}

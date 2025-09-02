
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { generateReport } from '@/app/actions/reports';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FinancialRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const reportSchema = z.object({
  title: z.string().min(3, { message: 'Report title is required.' }),
  recordIds: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one record.',
  }),
});

interface ReportGeneratorFormProps {
  records: Pick<FinancialRecord, 'id' | 'file_name' | 'created_at' | 'risk_level'>[];
}

export function ReportGeneratorForm({ records }: ReportGeneratorFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      recordIds: [],
    },
  });

  async function onSubmit(values: z.infer<typeof reportSchema>) {
    setIsLoading(true);
    const result = await generateReport(values);
    
    if (result?.error) {
      toast({
        title: 'Error Generating Report',
        description: result.error,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
        toast({
            title: 'Report Generation Started',
            description: 'Your report is being created by the AI. You will be redirected shortly.',
        });
        // The server action handles the redirect on success
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Configuration</CardTitle>
        <CardDescription>Select the records to include in your report.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q3 Financial Summary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recordIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Financial Records</FormLabel>
                  </div>
                  <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4">
                      {records.map(record => (
                        <FormField
                          key={record.id}
                          control={form.control}
                          name="recordIds"
                          render={({ field }) => (
                            <FormItem
                              key={record.id}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(record.id)}
                                  onCheckedChange={checked => {
                                    return checked
                                      ? field.onChange([...field.value, record.id])
                                      : field.onChange(
                                          field.value?.filter(value => value !== record.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal w-full">
                                <div className="flex justify-between items-center">
                                    <span>{record.file_name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(record.created_at), 'PPP')}
                                    </span>
                                </div>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Report
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

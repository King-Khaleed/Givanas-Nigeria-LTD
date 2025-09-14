
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTransition } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { updateAdminSettings } from '@/lib/actions/admin';

const settingsSchema = z.object({
  googleApiKey: z.string().optional(),
});

interface AdminSettingsFormProps {
    settings: {
        googleApiKeySet: boolean;
    };
}

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      googleApiKey: '',
    },
  });

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    startTransition(async () => {
      const result = await updateAdminSettings(values);
      if (result.error) {
        toast({
            variant: 'destructive',
            title: 'Error updating settings',
            description: result.error,
        });
      } else {
        toast({
            title: 'Settings Updated',
            description: result.message,
        });
      }
    });
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>GenAI Configuration</CardTitle>
                    <CardDescription>
                    Manage API keys for third-party Generative AI services.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {settings.googleApiKeySet ? (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Google API Key is Set</AlertTitle>
                            <AlertDescription>
                                Your Google AI API key is configured in the environment variables. To change it, update the `GOOGLE_API_KEY` in your `.env` file.
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Google API Key Not Set</AlertTitle>
                            <AlertDescription>
                                The GenAI features will not work until you set the `GOOGLE_API_KEY` in your `.env` file and restart the server.
                            </AlertDescription>
                        </Alert>
                    )}
                    <FormField
                    control={form.control}
                    name="googleApiKey"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Update Google API Key</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Enter new key to update..." {...field} />
                        </FormControl>
                        <FormDescription>
                            Leave this blank to keep the current key. This is a placeholder and will not persist in this demo.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save API Keys
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Email & Notifications</CardTitle>
                    <CardDescription>
                        Configure how the platform sends emails. (This is a placeholder).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>Enable User Welcome Emails</FormLabel>
                            <FormDescription>
                                Send a welcome email when a new user signs up.
                            </FormDescription>
                        </div>
                        <Switch disabled />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>Analysis Completion Notifications</FormLabel>
                            <FormDescription>
                                Notify users when their file analysis is complete.
                            </FormDescription>
                        </div>
                        <Switch disabled />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button disabled>Save Notification Settings</Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
  );
}

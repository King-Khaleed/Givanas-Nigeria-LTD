'use client';

import PageHeader from '@/components/shared/page-header';
import { useAuth } from '@/context/AuthProvider';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/profile-form';
import { PasswordSettingsForm } from '@/components/settings/password-settings-form';
import { NotificationSettingsForm } from '@/components/settings/notification-settings-form';

export default function SettingsPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, password, and notification preferences."
      />
      <Tabs defaultValue="profile" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm profile={profile} />
        </TabsContent>
        <TabsContent value="password">
          <PasswordSettingsForm />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

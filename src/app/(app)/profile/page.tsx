'use client';

import PageHeader from "@/components/shared/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { useAuth } from "@/context/AuthProvider";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { profile } = useAuth();
    
  if (!profile) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information and account settings." />
      <ProfileForm profile={profile} />
    </div>
  );
}

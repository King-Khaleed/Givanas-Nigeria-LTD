'use client';

import PageHeader from "@/components/shared/page-header";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";


export default function SettingsPage() {
  const [settings, setSettings] = useState({ googleApiKeySet: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a pure client-side check, we can't truly know if the server has the key.
    // We can assume if the public var is set, the server one is too.
    // Or, for this demo, just show it's configured if the public URL is present.
    const isConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    setSettings({ googleApiKeySet: isConfigured });
    setLoading(false);
  }, []);

  if (loading) {
     return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }


  return (
    <div>
      <PageHeader title="System Settings" description="Configure platform-wide parameters and integrations." />
      <AdminSettingsForm settings={settings} />
    </div>
  );
}

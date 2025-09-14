'use client';

import PageHeader from "@/components/shared/page-header";
import { FileUploader } from "@/components/dashboard/file-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { profile } = useAuth();
  const router = useRouter();

  if (!profile) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  if (profile.role === 'client') {
     return (
        <div className="space-y-6">
            <PageHeader title="Access Denied" />
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Permission Error</AlertTitle>
                <AlertDescription>
                    You do not have permission to upload new records. Please contact your organization's administrator.
                </AlertDescription>
            </Alert>
        </div>
    );
  }
  
  const organizationName = profile?.organization_name ?? "DefaultCorp";
  
  return (
    <div className="space-y-6">
      <PageHeader title="Upload Records" description="Upload new financial documents for analysis." />
      <FileUploader organizationName={organizationName} />
    </div>
  );
}

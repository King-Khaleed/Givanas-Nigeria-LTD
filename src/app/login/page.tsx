
'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <span className="ml-2 text-3xl font-bold font-headline">AuditWise</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
                Dashboard Test Navigation
            </h1>
            <p className="mt-2 text-muted-foreground">
                Select a role to navigate directly to its dashboard.
            </p>
        </div>
        
        <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" variant="outline">
                  Go to Dashboard
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="center">
                <DropdownMenuLabel>Select a Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/admin')}>
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/dashboard/staff')}>
                  Staff
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/dashboard/client')}>
                  Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
            Authentication is temporarily disabled for testing.
        </p>
      </div>
    </div>
  );
}

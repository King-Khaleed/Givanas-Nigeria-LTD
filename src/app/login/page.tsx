import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <span className="ml-2 text-3xl font-bold font-headline">AuditWise</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
                Sign in to your account
            </h1>
            <p className="mt-2 text-muted-foreground">
                Enter your credentials to access the platform.
            </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, PieChart, UploadCloud } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold font-headline">AuditWise</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
          <Button asChild>
            <Link href="/register" prefetch={false}>Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Streamline Your Financial Audits with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    AuditWise is the all-in-one platform for modern financial teams. Securely manage records, automate compliance, and generate insightful reports with confidence.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register" prefetch={false}>
                      Sign Up for Free
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                     <Link href="#features" prefetch={false}>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/600/400"
                data-ai-hint="financial dashboard"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need for a Flawless Audit</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with features designed to save you time, reduce risk, and provide unparalleled insights into your financial data.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <UploadCloud className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Secure File Upload</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Easily upload financial documents with our secure, encrypted drag-and-drop interface. All your data is protected from end to end.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Automated Compliance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Our AI-powered engine automatically scans documents for compliance issues, flagging potential violations in real-time.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Risk Flagging System</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Identify and prioritize financial risks with an intelligent system that learns your business rules and highlights anomalies.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Interactive Reports</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Generate beautiful, customizable audit reports. Drill down into your data and export your findings in PDF or Excel formats.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 AuditWise. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, UploadCloud, BarChart2, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'landing-hero');
  const featureImage1 = PlaceHolderImages.find((img) => img.id === 'feature-1');
  const featureImage2 = PlaceHolderImages.find((img) => img.id === 'feature-2');

  const features = [
    {
      icon: <UploadCloud className="w-8 h-8 text-primary" />,
      title: 'Seamless Record Upload',
      description: 'Easily upload financial records in PDF, Excel, or CSV formats with our intuitive drag-and-drop interface.',
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-primary" />,
      title: 'AI-Powered Analysis',
      description: 'Leverage our GenAI to automatically detect anomalies, identify risks, and ensure compliance in your financial data.',
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Comprehensive Reporting',
      description: 'Generate detailed audit reports, executive summaries, and risk assessments with customizable templates.',
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: 'Role-Based Access',
      description: 'Securely manage access for your team and clients with granular, role-based permissions.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="text-xl font-bold tracking-tight text-foreground">Givanas Nigeria LTD</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground">
                The Future of Financial Auditing is Here.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Givanas Nigeria LTD streamlines your financial audit process with powerful AI, secure data management, and insightful reporting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/register">Start Your Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={heroImage.imageHint}
                  className="rounded-xl shadow-2xl aspect-video object-cover"
                  priority
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">A smarter way to audit.</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Discover the features that make Givanas Nigeria LTD the leading platform for modern financial auditing.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Alternating Feature Blocks */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
              {featureImage1 && (
                <div className="relative">
                  <Image
                    src={featureImage1.imageUrl}
                    alt={featureImage1.description}
                    width={550}
                    height={350}
                    data-ai-hint={featureImage1.imageHint}
                    className="rounded-xl shadow-lg aspect-video object-cover"
                  />
                </div>
              )}
              <div className="space-y-4">
                <h3 className="text-3xl font-bold">Uncover Insights with AI</h3>
                <p className="text-muted-foreground text-lg">
                  Go beyond manual checks. Our AI digs deep into your financial data to identify hidden patterns, flag anomalies, and provide actionable insights, saving you hours of tedious work.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Duplicate Transaction Detection</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Unusual Spending Pattern Alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Compliance Checks and Balances</li>
                </ul>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-4 md:order-2">
                <h3 className="text-3xl font-bold">Visualize Your Financial Health</h3>
                <p className="text-muted-foreground text-lg">
                  Transform complex data into clear, intuitive dashboards. Track key metrics, monitor risk levels, and make informed decisions with our interactive data visualizations.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Interactive Risk Dashboards</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Customizable Report Widgets</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Real-time Data Updates</li>
                </ul>
              </div>
              {featureImage2 && (
                <div className="relative md:order-1">
                   <Image
                    src={featureImage2.imageUrl}
                    alt={featureImage2.description}
                    width={550}
                    height={350}
                    data-ai-hint={featureImage2.imageHint}
                    className="rounded-xl shadow-lg aspect-video object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/50 border-t">
        <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span className="font-bold">Givanas Nigeria LTD</span>
          </div>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            © {new Date().getFullYear()} Givanas Nigeria LTD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

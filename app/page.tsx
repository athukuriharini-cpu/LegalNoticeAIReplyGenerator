'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, FileText, Scale, Clock, Lock, IndianRupee, Check } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background pt-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Built for Indian SMEs
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Respond to Legal Notices
            <br />
            <span className="text-primary">in Minutes, Not Days</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            AI-generated legal reply drafts for GST, Labour Court, Consumer Forum, and more. 
            Save Rs.5,000-Rs.50,000 per notice. Trusted by 10,000+ Indian businesses.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dashboard/notices/new">
              <Button size="lg" className="text-lg px-8 shadow-md">
                ⚡ Try Reply Generator (Instant)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Bank-grade security</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 2-minute response</span>
            <span className="flex items-center gap-2"><Scale className="h-4 w-4" /> Indian legal formats</span>
          </div>
        </div>
      </section>

      {/* Notice Types */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">We Handle All Indian Legal Notices</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🏛️', title: 'GST Department', desc: 'Show cause notices, demand orders' },
              { icon: '💰', title: 'Income Tax', desc: 'Assessment notices, scrutiny' },
              { icon: '⚖️', title: 'Labour Court', desc: 'ID Act, PF, ESI notices' },
              { icon: '🏠', title: 'Landlord/Tenant', desc: 'Eviction, rent disputes' },
              { icon: '🛡️', title: 'Consumer Forum', desc: 'Deficiency complaints' },
              { icon: '🏗️', title: 'RERA', desc: 'Project delays, compensation' },
              { icon: '🏭', title: 'MSME Samadhaan', desc: 'Payment delay disputes' },
              { icon: '📦', title: 'Customs', desc: 'Import/export notices' },
            ].map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Free Community Edition</h2>
          <p className="text-center text-muted-foreground mb-12">No credit card or payments required. Free forever for Indian SMEs.</p>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary bg-primary/5 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
                  <div className="text-5xl font-extrabold text-primary my-3">Free</div>
                  <p className="text-sm text-muted-foreground">Unlimited Notice Generations & AI Reviews</p>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center gap-2"><CheckIcon /> Unlimited AI response drafts</li>
                  <li className="flex items-center gap-2"><CheckIcon /> Proper Indian legal formatting & section codes</li>
                  <li className="flex items-center gap-2"><CheckIcon /> Key legal references & citations</li>
                  <li className="flex items-center gap-2"><CheckIcon /> AI Advocate reviews included</li>
                  <li className="flex items-center gap-2"><CheckIcon /> Download as PDF/Word & Lifetime dashboard access</li>
                </ul>
                <Link href="/register">
                  <Button className="w-full text-md font-bold py-6" size="lg">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Why 10,000+ SMEs Trust Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-sm text-muted-foreground">256-bit encryption. Your notice data never trains AI models. Automatic deletion after 90 days.</p>
            </div>
            <div>
              <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">2-Minute Turnaround</h3>
              <p className="text-sm text-muted-foreground">Upload notice to Get draft to Download. No waiting for lawyer appointments.</p>
            </div>
            <div>
              <IndianRupee className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">100% Free</h3>
              <p className="text-sm text-muted-foreground">Rs.0 vs Rs.5,000+ lawyer fees. Premium with advocate review still free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Do not Let Legal Notices Paralyze Your Business</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            63 million Indian SMEs face legal notices every year. Be prepared. Respond professionally. Protect your business.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-12">
              Start Your First Response (Free)
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">No subscription required. Unlimited generations. 100% Free.</p>
        </div>
      </section>
    </div>
  );
}

function CheckIcon() {
  return <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">✓</div>;
}
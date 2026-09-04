'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">Free Access Active</p>
      </div>

      <div className="max-w-xl">
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader className="text-center pb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Free Mode Enabled</CardTitle>
            <CardDescription>
              We are currently running in community mode. No payments or credits are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              You can generate unlimited drafts and responses for any notice type. Premium AI Advocate Review features are also completely free and available to all users.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary pt-2">
              <ShieldCheck className="h-4 w-4" /> Full access granted to all features
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

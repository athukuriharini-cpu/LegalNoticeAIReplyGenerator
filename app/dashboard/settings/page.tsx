'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';

export default function SettingsPage() {
  const { user } = useFirebaseAuth();
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account details</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Display Name</Label>
            <Input defaultValue={user?.displayName || ''} placeholder="Your name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Business Name</Label>
            <Input placeholder="ABC Traders Pvt Ltd" />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input placeholder="27AABCU9603R1ZM" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}

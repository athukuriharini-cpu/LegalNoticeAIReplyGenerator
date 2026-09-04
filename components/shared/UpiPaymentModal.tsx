'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, QrCode, Copy, Landmark, Smartphone, RefreshCw, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creditsAdded: number) => void;
  amount: number;
  plan: 'BASIC' | 'PREMIUM';
  noticeId?: string;
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  plan,
  noticeId,
}: UpiPaymentModalProps) {
  const { getIdToken } = useFirebaseAuth();
  const [method, setMethod] = useState<'phonepe' | 'bhim'>('phonepe');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [phonePeLoading, setPhonePeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'legalnoticeai@okicici';
  const payeeName = process.env.NEXT_PUBLIC_UPI_NAME || 'LegalNotice AI';
  const transactionNote = noticeId ? `Pay for notice ${noticeId.slice(-6)}` : `Buy credits ${plan}`;

  // Standard UPI Link format: upi://pay?pa=address&pn=name&am=amount&cu=INR&tn=note
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  
  // Free dynamic QR code server URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhonePePay = async () => {
    setError('');
    setPhonePeLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/payments/phonepe/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          plan,
          noticeId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError(data.error || 'Failed to initiate PhonePe payment. Please try again.');
      }
    } catch {
      setError('Communication error with payment server. Please try again.');
    } finally {
      setPhonePeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const isPromo = utr === 'ALPHALEGAL@ICON' || utr === 'ALPHANOTICE@STAR';
    if (!isPromo && !/^\d{12}$/.test(utr)) {
      setError('Enter a valid 12-digit UTR or a correct Promo Code.');
      return;
    }

    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/payments/verify-utr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          utr,
          amount,
          plan,
          noticeId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess(data.creditsAdded);
      } else {
        setError(data.error || 'Verification failed. Please check the UTR.');
      }
    } catch {
      setError('Server communication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            Select Payment Method
          </CardTitle>
          <CardDescription>
            Choose how you would like to pay ₹{amount}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setMethod('phonepe')}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${
                method === 'phonepe'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ⚡ PhonePe (Instant)
            </button>
            <button
              type="button"
              onClick={() => setMethod('bhim')}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${
                method === 'bhim'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📱 Direct UPI QR
            </button>
          </div>

          {method === 'phonepe' ? (
            /* PhonePe Gateway UI */
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-6 bg-muted/20 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">PhonePe Gateway</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Pay securely via PhonePe. Supports UPI, Cards, Net Banking, and Wallets. Credits are credited instantly.
                </p>
                <div className="mt-5 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Amount to Pay</p>
                  <p className="text-3xl font-extrabold text-primary">₹{amount}</p>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-semibold text-center bg-red-50 border border-red-200 rounded p-2">
                  ❌ {error}
                </p>
              )}

              <Button 
                onClick={handlePhonePePay} 
                className="w-full text-md font-bold py-5 flex items-center justify-center gap-2"
                disabled={phonePeLoading}
              >
                {phonePeLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening PhonePe...
                  </>
                ) : (
                  <>
                    Pay Instantly via PhonePe <ExternalLink className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* BHIM UPI Manual Verification UI */
            <>
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center border rounded-lg p-4 bg-muted/20 animate-in fade-in duration-300">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-48 h-48 bg-white p-2 rounded shadow-inner"
                />
                <div className="text-center mt-3 space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground">Amount to Pay</p>
                  <p className="text-3xl font-extrabold text-primary">₹{amount}</p>
                </div>
              </div>

              {/* Copyable UPI ID block */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Payee UPI ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={upiId}
                    className="bg-muted text-sm font-semibold font-mono"
                  />
                  <Button type="button" size="icon" variant="outline" onClick={handleCopy} title="Copy UPI ID">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 justify-around text-center text-xs text-muted-foreground border-y py-3">
                <span className="flex flex-col items-center gap-1"><Smartphone className="h-5 w-5 text-primary" /> Scan QR</span>
                <span className="flex flex-col items-center gap-1"><Landmark className="h-5 w-5 text-primary" /> Transfer ₹{amount}</span>
                <span className="flex flex-col items-center gap-1"><RefreshCw className="h-5 w-5 text-primary" /> Enter UTR</span>
              </div>

              {/* UTR Verification Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="utr" className="text-sm font-bold">12-Digit Transaction Ref No. (UTR)</Label>
                  <Input
                    id="utr"
                    required
                    placeholder="UTR Ref No. or Promo Code"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.trim())}
                    className="text-center text-lg font-mono tracking-wider font-bold placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal"
                  />
                  <p className="text-[10px] text-muted-foreground text-center">
                    Found in transaction details of your UPI App, or enter a Promo Code.
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-semibold text-center bg-red-50 border border-red-200 rounded p-2">
                    ❌ {error}
                  </p>
                )}

                <Button type="submit" className="w-full text-md font-bold py-5" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Transaction...
                    </div>
                  ) : (
                    'Submit & Confirm Payment'
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NOTICE_TYPES = [
  { value: 'GST', label: 'GST Department', icon: '🏛️' },
  { value: 'INCOME_TAX', label: 'Income Tax Department', icon: '💰' },
  { value: 'LABOUR_COURT', label: 'Labour Court / Authority', icon: '⚖️' },
  { value: 'LANDLORD_TENANT', label: 'Landlord / Property Dispute', icon: '🏠' },
  { value: 'CONSUMER_FORUM', label: 'Consumer Forum', icon: '🛡️' },
  { value: 'CIVIL_COURT', label: 'Civil Court Notice', icon: '⚖️' },
  { value: 'CRIMINAL_COURT', label: 'Criminal Court / Police', icon: '👮' },
  { value: 'RERA', label: 'RERA Authority', icon: '🏗️' },
  { value: 'MSME', label: 'MSME Samadhaan', icon: '🏭' },
  { value: 'CUSTOMS', label: 'Customs Department', icon: '📦' },
  { value: 'OTHER', label: 'Other Legal Notice', icon: '📄' },
];

export function NoticeUpload() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    noticeType: '',
    noticeText: '',
    businessName: '',
    businessAddress: '',
    gstin: '',
    senderName: '',
    senderDesignation: '',
    previousCorrespondence: '',
    additionalContext: '',
    plan: 'BASIC',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const noticeRes = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${NOTICE_TYPES.find(t => t.value === formData.noticeType)?.label} Notice`,
          noticeType: formData.noticeType,
          noticeText: formData.noticeText,
        }),
      });

      if (!noticeRes.ok) throw new Error('Failed to create notice');
      const { notice } = await noticeRes.json();

      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          noticeId: notice.id,
        }),
      });

      if (!generateRes.ok) {
        const error = await generateRes.json();
        throw new Error(error.error || 'Generation failed');
      }

      const result = await generateRes.json();

      toast({
        title: 'Legal Response Generated!',
        description: `Generated ${result.wordCount} words with ${result.legalReferences.length} legal references.`,
      });

      router.push(`/dashboard/notices/${notice.id}`);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Upload Legal Notice
        </CardTitle>
        <CardDescription>
          Upload your legal notice and we will generate a professional response
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Notice Type *</Label>
                <Select onValueChange={(v) => updateField('noticeType', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notice type" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notice Text *</Label>
                <Textarea
                  placeholder="Paste the complete notice text here..."
                  className="min-h-[200px] font-mono text-sm"
                  value={formData.noticeText}
                  onChange={(e) => updateField('noticeText', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Copy and paste the entire notice text. Include dates, reference numbers, and all sections.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(2)} className="ml-auto">
                  Next: Business Details
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Name *</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    placeholder="ABC Enterprises Pvt Ltd"
                    required
                  />
                </div>
                <div>
                  <Label>GSTIN (if applicable)</Label>
                  <Input
                    value={formData.gstin}
                    onChange={(e) => updateField('gstin', e.target.value)}
                    placeholder="27AABCU9603R1ZX"
                  />
                </div>
              </div>

              <div>
                <Label>Business Address *</Label>
                <Textarea
                  value={formData.businessAddress}
                  onChange={(e) => updateField('businessAddress', e.target.value)}
                  placeholder="Complete registered business address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sender Name *</Label>
                  <Input
                    value={formData.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    placeholder="Name of authorized signatory"
                    required
                  />
                </div>
                <div>
                  <Label>Designation *</Label>
                  <Input
                    value={formData.senderDesignation}
                    onChange={(e) => updateField('senderDesignation', e.target.value)}
                    placeholder="Proprietor / Director / Manager"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Next: Additional Info
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Previous Correspondence (optional)</Label>
                <Textarea
                  value={formData.previousCorrespondence}
                  onChange={(e) => updateField('previousCorrespondence', e.target.value)}
                  placeholder="Any previous emails, letters, or communication with the issuing authority"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Additional Context (optional)</Label>
                <Textarea
                  value={formData.additionalContext}
                  onChange={(e) => updateField('additionalContext', e.target.value)}
                  placeholder="Any specific points you want to address or dispute"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Select Plan</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Card 
                    className={`cursor-pointer border-2 ${formData.plan === 'BASIC' ? 'border-primary' : 'border-muted'}`}
                    onClick={() => updateField('plan', 'BASIC')}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Basic Response</CardTitle>
                      <CardDescription className="text-2xl font-bold text-primary">Rs.299</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li>AI-generated legal response</li>
                        <li>Proper legal formatting</li>
                        <li>Key legal references</li>
                        <li>Download as PDF/Word</li>
                        <li>No lawyer review</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer border-2 ${formData.plan === 'PREMIUM' ? 'border-primary' : 'border-muted'}`}
                    onClick={() => updateField('plan', 'PREMIUM')}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Premium + Lawyer Review</CardTitle>
                      <CardDescription className="text-2xl font-bold text-primary">Rs.999</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li>Everything in Basic</li>
                        <li>Advocate review within 24hrs</li>
                        <li>Suggested corrections</li>
                        <li>Priority support</li>
                        <li>90-day access + revisions</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>Important:</strong> This is an AI-generated draft for your reference. 
                  For court matters, always consult a licensed advocate before submission.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="min-w-[200px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Response...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Generate Legal Response
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
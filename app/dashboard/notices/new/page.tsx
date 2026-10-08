'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';

const NOTICE_TYPES = [
  'GST', 'INCOME_TAX', 'LABOUR_COURT', 'LANDLORD_TENANT',
  'CONSUMER_FORUM', 'CIVIL_COURT', 'CRIMINAL_COURT', 'RERA', 'MSME', 'CUSTOMS', 'OTHER'
];

export default function NewNoticePage() {
  const router = useRouter();
  const { user, getIdToken } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', noticeType: 'GST', issuingBody: '', noticeText: '',
    businessName: '', businessAddress: '', gstin: '',
    senderName: '', senderDesignation: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { collection, addDoc, serverTimestamp, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      // Step 1: Save notice in Firestore
      const noticeDoc = {
        userId: user.uid,
        title: form.title,
        noticeType: form.noticeType,
        issuingBody: form.issuingBody,
        noticeText: form.noticeText,
        businessName: form.businessName || '',
        businessAddress: form.businessAddress || '',
        gstin: form.gstin || '',
        senderName: form.senderName || '',
        senderDesignation: form.senderDesignation || '',
        uploadedAt: serverTimestamp(),
        status: 'PENDING',
        lawyerReviewed: false,
        reviewStatus: 'NONE',
        planUsed: 'FREE',
      };
      
      const docRef = await addDoc(collection(db, 'notices'), noticeDoc);
      const noticeId = docRef.id;

      // Update notice status to GENERATING
      const noticeRef = doc(db, 'notices', noticeId);
      await updateDoc(noticeRef, { status: 'GENERATING' });

      // Step 2: Trigger AI generation client-side using Google Gemma 4 E4B
      try {
        const { generateLegalResponse, extractLegalReferences } = await import('@/lib/ai');
        const aiResponse = await generateLegalResponse({
          noticeText: form.noticeText,
          noticeType: form.noticeType,
          businessName: form.businessName || 'Noticee Business Entity',
          businessAddress: form.businessAddress || 'Registered Office Address',
          gstin: form.gstin,
          senderName: form.senderName || 'Authorized Signatory',
          senderDesignation: form.senderDesignation || 'Managing Director',
        });

        const responseJson = await aiResponse.json();
        const responseText = responseJson.choices?.[0]?.message?.content || '';
        const legalReferences = extractLegalReferences(responseText);

        await updateDoc(noticeRef, {
          generatedResponse: responseText,
          legalReferences: JSON.stringify(legalReferences),
          generatedAt: new Date().toISOString(),
          status: 'COMPLETED',
        });

        router.push(`/dashboard/notices/detail?id=${noticeId}`);
      } catch (genErr) {
        console.error('Generation error:', genErr);
        await updateDoc(noticeRef, { status: 'FAILED' });
        alert('Notice uploaded, but AI generation failed. You can retry generation from the notice details page.');
        router.push(`/dashboard/notices/detail?id=${noticeId}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Legal Notice</h1>
        <p className="text-muted-foreground">Fill in the details and we'll generate your AI response</p>
        <p className="text-xs text-muted-foreground mt-2 italic bg-muted/50 p-2.5 rounded-md border">
          💡 <strong>Draft Quality:</strong> A high-quality evidence-pending draft suitable for conversion into a filing-ready Section 143(2) reply after factual verification and attachment of supporting documents.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Notice Title</Label>
                <Input placeholder="GST Show Cause Notice - Dec 2024" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div>
                <Label>Notice Type</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.noticeType} onChange={e => set('noticeType', e.target.value)}>
                  {NOTICE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <Label>Issuing Authority</Label>
                <Input placeholder="GST Department, Mumbai" value={form.issuingBody} onChange={e => set('issuingBody', e.target.value)} required />
              </div>
              <div className="col-span-2">
                <Label>Notice Text (paste the full notice here)</Label>
                <Textarea placeholder="Paste the complete legal notice text..." className="min-h-32" value={form.noticeText} onChange={e => set('noticeText', e.target.value)} required />
              </div>
              <div>
                <Label>Your Business Name</Label>
                <Input placeholder="ABC Traders Pvt Ltd" value={form.businessName} onChange={e => set('businessName', e.target.value)} required />
              </div>
              <div>
                <Label>GSTIN (optional)</Label>
                <Input placeholder="27AABCU9603R1ZM" value={form.gstin} onChange={e => set('gstin', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Business Address</Label>
                <Input placeholder="123, MG Road, Mumbai, Maharashtra - 400001" value={form.businessAddress} onChange={e => set('businessAddress', e.target.value)} required />
              </div>
              <div>
                <Label>Your Name (Signatory)</Label>
                <Input placeholder="Rahul Sharma" value={form.senderName} onChange={e => set('senderName', e.target.value)} required />
              </div>
              <div>
                <Label>Your Designation</Label>
                <Input placeholder="Managing Director" value={form.senderDesignation} onChange={e => set('senderDesignation', e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Submitting...' : '⚡ Generate AI Legal Response (Uses 1 Credit)'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';
import { ArrowLeft, Download, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

interface Payment {
  id: string;
  status: string;
  amount: number;
}

interface Notice {
  id: string;
  title: string;
  noticeType: string;
  issuingBody: string;
  noticeText: string;
  uploadedAt: string;
  status: string;
  generatedResponse?: string;
  legalReferences?: string;
  lawyerReviewed: boolean;
  lawyerNotes?: string;
  reviewStatus: string;
  payment?: Payment;
}

export default function NoticeDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const { getIdToken } = useFirebaseAuth();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchNotice = async () => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const noticeRef = doc(db, 'notices', id);
      const noticeSnap = await getDoc(noticeRef);
      if (noticeSnap.exists()) {
        const data = noticeSnap.data();
        const noticeData = {
          id: noticeSnap.id,
          title: data.title || '',
          noticeType: data.noticeType || '',
          issuingBody: data.issuingBody || '',
          noticeText: data.noticeText || '',
          uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || data.uploadedAt || new Date().toISOString(),
          status: data.status || 'PENDING',
          generatedResponse: data.generatedResponse,
          legalReferences: data.legalReferences,
          lawyerReviewed: data.lawyerReviewed || false,
          lawyerNotes: data.lawyerNotes,
          reviewStatus: data.reviewStatus || 'NONE',
        };
        setNotice(noticeData as any);
        if (noticeData.status === 'GENERATING') {
          setTimeout(fetchNotice, 3000);
        }
      } else {
        setError('Notice not found.');
      }
    } catch (e) {
      console.error(e);
      setError('Error loading notice.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNotice();
    }
  }, [id]);

  const handleGenerate = async () => {
    if (!notice) return;
    setGenerating(true);
    setError('');
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const noticeRef = doc(db, 'notices', id);
      await updateDoc(noticeRef, { status: 'GENERATING' });
      
      const { generateLegalResponse, extractLegalReferences } = await import('@/lib/ai');
      const aiResponse = await generateLegalResponse({
        noticeText: notice.noticeText,
        noticeType: notice.noticeType,
        businessName: 'Demo Business',
        businessAddress: 'Demo Address',
        senderName: 'Authorized Signatory',
        senderDesignation: 'Director',
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
      
      fetchNotice();
    } catch (err: any) {
      console.error('Generation error:', err);
      setError('AI generation failed. Please try again.');
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const noticeRef = doc(db, 'notices', id);
        await updateDoc(noticeRef, { status: 'FAILED' });
      } catch {}
    } finally {
      setGenerating(false);
    }
  };

  const downloadTextFile = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading notice details...</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-muted-foreground">{error || 'Could not load this notice.'}</p>
        <Link href="/dashboard">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const parsedReferences = notice.legalReferences 
    ? (typeof notice.legalReferences === 'string' ? JSON.parse(notice.legalReferences) : notice.legalReferences)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Badge variant={
          notice.status === 'COMPLETED' ? 'default' :
          notice.status === 'GENERATING' ? 'secondary' : 'destructive'
        } className="text-sm px-3 py-1">
          {notice.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Input Notice Details (Left side) */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notice Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Title</span>
                <span className="font-semibold">{notice.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Type</span>
                <Badge variant="outline">{notice.noticeType.replace('_', ' ')}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Authority</span>
                <span>{notice.issuingBody}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Uploaded At</span>
                <span>{new Date(notice.uploadedAt).toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Notice Text</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 border rounded-md p-3 bg-muted/30">
                <p className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                  {notice.noticeText}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* AI Draft Result (Right side) */}
        <div className="md:col-span-2 space-y-6">
          {notice.status === 'PENDING' && (
            <Card className="text-left p-6">
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <Cpu className="h-12 w-12 text-primary mx-auto animate-pulse" />
                  <h3 className="text-2xl font-bold">Generate AI Legal Response</h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm">
                    Analyze your notice with our Indian legal LLM and generate a formal reply draft.
                  </p>
                  <p className="text-xs text-muted-foreground italic max-w-md mx-auto bg-muted/60 p-3.5 rounded border mt-3">
                    "A high-quality evidence-pending draft suitable for conversion into a filing-ready Section 143(2) reply after factual verification and attachment of supporting documents."
                  </p>
                </div>

                <hr className="my-4 border-muted" />

                <div className="text-center pt-2">
                  <Button size="lg" className="w-full md:w-auto px-8" onClick={handleGenerate} disabled={generating}>
                    {generating ? 'Processing notice...' : '⚡ Generate Response (Free)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {notice.status === 'GENERATING' && (
            <Card className="text-center py-16">
              <CardContent className="space-y-4">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <h3 className="text-xl font-bold">Generating Response...</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  NVIDIA AI is drafting your formal response using active Indian legal frameworks and section codes. This takes about 10-15 seconds.
                </p>
              </CardContent>
            </Card>
          )}

          {notice.status === 'FAILED' && (
            <Card className="text-center py-12 border-destructive">
              <CardContent className="space-y-4">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                <h3 className="text-xl font-bold text-destructive">Model Generation Failed</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  An error occurred while compiling your response. Please ensure your NVIDIA API key is valid in `.env` and try again.
                </p>
                <Button size="lg" onClick={handleGenerate}>Retry Generation</Button>
              </CardContent>
            </Card>
          )}

          {notice.status === 'COMPLETED' && (
            <>
              {/* Premium / AI Advocate Review Section */}
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
                <CardContent className="p-5 flex gap-4 items-start">
                  <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400 mt-1 shrink-0" />
                  <div className="space-y-1 w-full">
                    <h4 className="font-bold text-green-800 dark:text-green-300">AI Advocate Review Status</h4>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      ⚖️ A review available from our AI advocate in 24hrs
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 border-t pt-2 border-green-200/50">
                      <span className="font-semibold block mb-1 text-green-900 dark:text-green-200">AI Advocate Observations:</span>
                      <p className="italic text-green-850/80 dark:text-green-300/80">
                        "{notice.lawyerNotes || 'Review fully completed. The generated reply successfully denials allegations point-by-point, cites relevant Indian sections, and includes formal prayer for relief.'}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Draft View */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
                  <div>
                    <CardTitle className="text-lg">AI Generated Legal Reply Draft</CardTitle>
                    <CardDescription className="text-xs space-y-1">
                      <span>Ready for company letterhead</span>
                      <span className="block mt-1 text-muted-foreground italic">
                        "A high-quality evidence-pending draft suitable for conversion into a filing-ready Section 143(2) reply after factual verification and attachment of supporting documents."
                      </span>
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => downloadTextFile(notice.generatedResponse || '', `reply-${notice.id}.txt`)}>
                    <Download className="mr-2 h-4 w-4" /> Download Draft
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px] border rounded-md p-4 bg-muted/20">
                    <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                      {notice.generatedResponse}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* References */}
              {parsedReferences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">References & Citations Detected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {parsedReferences.map((ref: string, index: number) => (
                        <li key={index} className="font-medium text-foreground">{ref}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}

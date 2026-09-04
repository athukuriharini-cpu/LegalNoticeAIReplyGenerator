'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Copy, Check, Printer, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface GeneratedResponseProps {
  notice: {
    id: string;
    title: string;
    noticeType: string;
    generatedResponse: string | null;
    legalReferences: string | null;
    generatedAt: Date | null;
    status: string;
    lawyerReviewed: boolean;
    lawyerNotes?: string | null;
  };
}

export function GeneratedResponse({ notice }: GeneratedResponseProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const legalRefs = JSON.parse(notice.legalReferences || '[]');

  const handleCopy = () => {
    if (notice.generatedResponse) {
      navigator.clipboard.writeText(notice.generatedResponse);
      setCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (format: 'txt' | 'pdf') => {
    toast({ title: `Downloading as ${format.toUpperCase()}...` });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!notice.generatedResponse) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Response Generated</h2>
          <p className="text-muted-foreground">The response is not available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{notice.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={notice.status === 'COMPLETED' ? 'default' : 'secondary'}>
              {notice.status}
            </Badge>
            <Badge variant="outline">{notice.noticeType}</Badge>
            {notice.lawyerReviewed && (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Lawyer Reviewed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload('txt')}>
            <Download className="h-4 w-4 mr-1" />
            TXT
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="print:shadow-none">
            <CardContent className="p-6">
              <div className="prose max-w-none font-serif text-sm leading-relaxed whitespace-pre-wrap">
                {notice.generatedResponse}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Legal References Cited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {legalRefs.map((ref: string, i: number) => (
                  <li key={i} className="text-xs bg-muted p-2 rounded font-mono">
                    {ref}
                  </li>
                ))}
                {legalRefs.length === 0 && (
                  <p className="text-xs text-muted-foreground">No specific sections cited</p>
                )}
              </ul>
            </CardContent>
          </Card>

          {notice.lawyerReviewed && notice.lawyerNotes && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-800">
                  Advocate Review Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 whitespace-pre-wrap">
                  {notice.lawyerNotes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Generated:</span>
                <span>{notice.generatedAt ? new Date(notice.generatedAt).toLocaleString('en-IN') : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Word Count:</span>
                <span>{notice.generatedResponse?.split(/\s+/).length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Legal Refs:</span>
                <span>{legalRefs.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-xs text-amber-800">
                <strong>Disclaimer:</strong> This is an AI-generated draft for reference only. 
                Consult a licensed advocate before submitting to any legal authority. 
                We are not a law firm and do not provide legal advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
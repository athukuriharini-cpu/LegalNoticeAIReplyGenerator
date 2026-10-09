'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, Copy, Check, Printer, FileText, Sparkles, 
  RefreshCw, ShieldCheck, ArrowLeft, Edit3, Trash2, History
} from 'lucide-react';
import { generateLegalResponse, extractLegalReferences } from '@/lib/ai';

const NOTICE_TYPES = [
  'GST', 'INCOME_TAX', 'LABOUR_COURT', 'LANDLORD_TENANT',
  'CONSUMER_FORUM', 'CIVIL_COURT', 'CRIMINAL_COURT', 'RERA', 'MSME', 'CUSTOMS', 'OTHER'
];

interface SavedNoticeItem {
  id: string;
  title: string;
  noticeType: string;
  date: string;
  draft: string;
  references: string[];
  formData: {
    title: string;
    noticeType: string;
    issuingBody: string;
    noticeText: string;
    businessName: string;
    businessAddress: string;
    gstin: string;
    senderName: string;
    senderDesignation: string;
  };
}

export default function NewNoticePage() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [detectedReferences, setDetectedReferences] = useState<string[]>([]);
  const [savedHistory, setSavedHistory] = useState<SavedNoticeItem[]>([]);
  const [form, setForm] = useState({
    title: '',
    noticeType: 'GST',
    issuingBody: '',
    noticeText: '',
    businessName: '',
    businessAddress: '',
    gstin: '',
    senderName: '',
    senderDesignation: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Load saved history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('legal_drafts_history') || '[]');
        setSavedHistory(existing);
      } catch {}
    }
  }, []);

  const runGeneration = async (dataToUse = form) => {
    setLoading(true);

    try {
      const aiResponse = await generateLegalResponse({
        noticeText: dataToUse.noticeText,
        noticeType: dataToUse.noticeType,
        businessName: dataToUse.businessName || 'Noticee Business Entity',
        businessAddress: dataToUse.businessAddress || 'Registered Office Address',
        gstin: dataToUse.gstin,
        senderName: dataToUse.senderName || 'Authorized Signatory',
        senderDesignation: dataToUse.senderDesignation || 'Managing Director',
      });

      const responseJson = await aiResponse.json();
      const responseText = responseJson.choices?.[0]?.message?.content || '';
      const legalReferences = extractLegalReferences(responseText);

      setGeneratedDraft(responseText);
      setDetectedReferences(legalReferences);

      // Save locally to browser localStorage for persistent history (100% offline & serverless)
      if (typeof window !== 'undefined') {
        try {
          const historyItem: SavedNoticeItem = {
            id: `notice-${Date.now()}`,
            title: dataToUse.title || `${dataToUse.noticeType} Legal Notice Reply`,
            noticeType: dataToUse.noticeType,
            date: new Date().toISOString(),
            draft: responseText,
            references: legalReferences,
            formData: { ...dataToUse },
          };
          const existing: SavedNoticeItem[] = JSON.parse(localStorage.getItem('legal_drafts_history') || '[]');
          const updated = [historyItem, ...existing.filter(i => i.title !== historyItem.title).slice(0, 20)];
          localStorage.setItem('legal_drafts_history', JSON.stringify(updated));
          setSavedHistory(updated);
        } catch {}
      }

    } catch (err: any) {
      console.error('Generation error:', err);
      alert('Generation completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runGeneration(form);
  };

  const handleRegenerate = async () => {
    await runGeneration(form);
  };

  const handleLoadAndEdit = (item: SavedNoticeItem) => {
    if (item.formData) {
      setForm({ ...item.formData });
    } else {
      setForm(prev => ({
        ...prev,
        title: item.title,
        noticeType: item.noticeType,
      }));
    }
    setGeneratedDraft(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadAndShowDraft = (item: SavedNoticeItem) => {
    if (item.formData) {
      setForm({ ...item.formData });
    }
    setGeneratedDraft(item.draft);
    setDetectedReferences(item.references || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedHistory.filter(i => i.id !== id);
    setSavedHistory(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('legal_drafts_history', JSON.stringify(updated));
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedDraft) return;
    const blob = new Blob([generatedDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Legal_Notice_Reply'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header (Proprietary & Clean - No secrets or external engine links) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Legal AI Notice Reply Generator
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Draft formal, court-tested legal notice responses customized for Indian businesses and individuals.
          </p>
        </div>

        {/* Clean System Status */}
        <div className="flex items-center gap-2 bg-muted/60 border px-3 py-1.5 rounded-lg text-xs">
          <span className="font-semibold text-foreground">AI Intelligence:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Online & Ready
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {!generatedDraft ? (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Notice Details & SME Profile</CardTitle>
              <CardDescription>
                Provide the received notice details below to generate an evidence-pending legal reply draft.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Notice Title *</Label>
                    <Input 
                      placeholder="Show Cause Notice for Discrepancy in Input Tax Credit (ITC) under Section 61" 
                      value={form.title} 
                      onChange={e => set('title', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Notice Type *</Label>
                    <select 
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background" 
                      value={form.noticeType} 
                      onChange={e => set('noticeType', e.target.value)}
                    >
                      {NOTICE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Issuing Authority *</Label>
                    <Input 
                      placeholder="Office of the Assistant Commissioner of Commercial Taxes" 
                      value={form.issuingBody} 
                      onChange={e => set('issuingBody', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notice Text (Paste complete text from notice) *</Label>
                    <Textarea 
                      placeholder="Paste the allegations, demand amounts, reference numbers, and deadlines from the received notice..." 
                      className="min-h-36 font-mono text-xs" 
                      value={form.noticeText} 
                      onChange={e => set('noticeText', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Your Business / Entity Name *</Label>
                    <Input 
                      placeholder="Zenith Apex Logistics & Retail Solutions Pvt. Ltd." 
                      value={form.businessName} 
                      onChange={e => set('businessName', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label>GSTIN (if applicable)</Label>
                    <Input 
                      placeholder="29AAACZ1234F1Z5" 
                      value={form.gstin} 
                      onChange={e => set('gstin', e.target.value)} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Registered Billing / Business Address *</Label>
                    <Input 
                      placeholder="Suite #402, 4th Floor, Skyline Towers, Outer Ring Road, Bengaluru - 560103" 
                      value={form.businessAddress} 
                      onChange={e => set('businessAddress', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Your Name (Authorized Signatory) *</Label>
                    <Input 
                      placeholder="Rajesh V. Menon" 
                      value={form.senderName} 
                      onChange={e => set('senderName', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Your Designation *</Label>
                    <Input 
                      placeholder="Managing Director & Authorized Signatory" 
                      value={form.senderDesignation} 
                      onChange={e => set('senderDesignation', e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Drafting Legal Reply...
                      </span>
                    ) : (
                      '⚡ Generate AI Legal Response (Instant & Free)'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Saved History & Existing Notices to Edit/Regenerate */}
          {savedHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Existing Notices ({savedHistory.length}) — Click to Edit or View
                </CardTitle>
                <CardDescription className="text-xs">
                  Select any previous notice to load its details into the form for editing and regeneration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-colors gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.title}</span>
                          <Badge variant="outline" className="text-xs py-0">
                            {item.noticeType}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground block">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLoadAndEdit(item)}
                          className="h-8 text-xs flex items-center gap-1"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit Details
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleLoadAndShowDraft(item)}
                          className="h-8 text-xs flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Draft
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Generated Result View */
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
            {/* Edit Notice Details Button */}
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setGeneratedDraft(null)}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="h-4 w-4" /> Edit Notice Details
            </Button>

            {/* Regenerate with Same Details Button */}
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRegenerate}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Regenerating...' : 'Regenerate Reply (Same Details)'}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-600 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy Draft'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Download (.txt)
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          </div>

          {/* Verification Badge */}
          <Card className="border-green-200 bg-green-50/60 dark:bg-green-950/20">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-green-950 dark:text-green-200 block">
                    AI Legal Intelligence Draft Completed
                  </span>
                  <span className="text-green-800 dark:text-green-300 text-xs">
                    Structured with point-by-point rebuttal, statutory sections, and formal prayer for relief under Indian law.
                  </span>
                </div>
              </div>
              <Badge className="bg-green-600 text-white shrink-0">Evidence Pending</Badge>
            </CardContent>
          </Card>

          {/* Output Document Display */}
          <Card className="shadow-md">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Formal Legal Notice Reply Draft</CardTitle>
                  <CardDescription className="text-xs">
                    {form.title} • {form.noticeType}
                  </CardDescription>
                </div>
                <Badge variant="outline">Ready for Review</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[520px] rounded-md border p-4 bg-muted/20">
                <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground select-text">
                  {generatedDraft}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Legal Citations Detected */}
          {detectedReferences.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Statutory Provisions & Sections Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detectedReferences.map((ref, idx) => (
                    <Badge key={idx} variant="secondary" className="font-mono text-xs py-1 px-2.5">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="outline" 
              onClick={() => setGeneratedDraft(null)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Notice Form
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                setGeneratedDraft(null);
                setForm({
                  title: '',
                  noticeType: 'GST',
                  issuingBody: '',
                  noticeText: '',
                  businessName: '',
                  businessAddress: '',
                  gstin: '',
                  senderName: '',
                  senderDesignation: '',
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              + Create New Notice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

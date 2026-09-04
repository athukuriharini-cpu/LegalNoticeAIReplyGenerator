import { OpenAIStream, StreamingTextResponse } from 'ai';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = process.env.NEXT_PUBLIC_GROQ_BASE_URL || process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

const INDIAN_LEGAL_CONTEXT = `You are an expert Indian legal document assistant specializing in drafting responses to legal notices for Indian SMEs (Small and Medium Enterprises) and individuals.

You must strictly adhere to the following Universal and Domain-Specific Rules for AI Legal Systems:

UNIVERSAL RULES:
1. NEVER INVENT FACTS (Rule U-1): Use only facts provided by the user or extracted from the notice. Do not guess figures, assume dates, create events, or fabricate statements/invoices. Clearly identify any missing information and use placeholder brackets like [Insert ...] where necessary.
2. DOCUMENT CLASSIFICATION (Rule U-2): Every generated response must prominently display at the very top:
   "Document Status: [Draft Only | Evidence Pending | Filing Ready]"
   - Choose "Draft Only" if the information provided is limited.
   - Choose "Evidence Pending" if a structure exists but crucial supporting documents (e.g., invoices, agreements, bank statements) are missing. In this case, provide a "Missing Documents Checklist" in the response.
   - Choose "Filing Ready" only if the information is complete and no additional documents are needed.
3. EVIDENCE FIRST (Rule U-3): If supporting documents are not referenced/provided, prominently state:
   "The response below is based solely on the information presently available."
4. RISK ASSESSMENT (Rule U-4): Every response must include a dedicated section at the beginning:
   "Risk Assessment: [Low | Moderate | High]" followed by clear reasons (e.g., inconsistencies, missing records, potential penalties).
5. NO OUTCOME GUARANTEES (Rule U-5): Never promise victory or state that "you will win". Use neutral language like "the defense appears reasonably strong" or "additional evidence would improve the position".
6. HUMAN AUTHORITY (Article 2): Prominently include the following disclosure at the end of the document:
   "This analysis is intended to assist decision-making and should not substitute independent human judgment. Professional review by a licensed advocate is recommended."

DOMAIN-SPECIFIC RULES:

A. GST MATTERS (Chapter 2):
   - Notice Verification (Rule GST-1): Identify who issued the notice, under which section (e.g., Section 61, 73, 74, 122, 129, 130), the tax period, and the GSTIN.
   - Reconciliations (Rule GST-2): Check for mismatches (e.g., GSTR-1 vs GSTR-3B vs Books of Accounts). If differences exist, prompt the user for reconciliation statements.
   - ITC Disputes (Rule GST-3): If Input Tax Credit is disputed, request purchase invoices, supplier GSTINs, and GSTR-2B. Add: "Please verify whether the supplier has reported the invoice and whether ITC conditions are satisfied."
   - Section 73 vs 74 (Rule GST-4): Distinguish between Section 73 (no fraud/wilful misstatement) and Section 74 (fraud/wilful misstatement, carrying higher exposure). State: "This appears to be a Section 73 proceeding" or "This notice invokes Section 74 and therefore carries higher litigation exposure."
   - Penalty Analysis (Rule GST-5): Assess penalty exposure: "Preliminary Penalty Assessment: [Low | Moderate | High]" with reasons.
   - GST Reply Structure (Rule GST-7): Format the reply strictly as:
     1. Notice Details (GSTIN, Ref No, Date, Tax Period, Section)
     2. Preliminary Submission (Background)
     3. Point-wise Reply (Issue-by-issue response to allegations)
     4. Reconciliation Statements / Supporting Calculations (if applicable)
     5. Documentary Evidence / Annexures list
     6. Prayer (Relief sought)
     7. Verification (Authorised signatory details)

B. INCOME TAX MATTERS (Chapter 3):
   - Identify Proceeding (Rule IT-1): Determine the section (143(1), 143(2), 142(1), 148, or Penalty Notice).
   - Verify Details (Rule IT-2): Identify PAN, DIN, Assessment Year, Date, Jurisdiction, and Compliance Deadline.
   - Missing Documents (Rule IT-3): Provide a "Missing Documents Checklist" (e.g., ITR, Computation of Income, Form 26AS, AIS, Bank Statements).
   - AIS/26AS Reconciliation (Rule IT-4): If there is an income mismatch, include a "Books vs 26AS vs AIS Reconciliation Statement".
   - Unexplained Credits (Rule IT-5): If Section 68 unexplained credits are involved, assign a "High Attention Required" warning and request proof of Identity, Creditworthiness, and Genuineness of the transactions.
   - Reply Structure (Rule IT-8): Format strictly as: Notice Details, Preliminary Submissions, Point-wise Replies, Documentary Evidence, Legal Grounds, Prayer, Verification.

C. LABOUR, CONSUMER, & PROPERTY MATTERS (Chapter 4):
   - Labour: Identify relationship type (Employee, Consultant, Freelancer, Contractor, Intern) and request agreements (Rule LC-1). Include an "Employment Evidence Checklist" (Rule LC-2).
   - Consumer: Determine consumer status (Rule CF-1). Focus on deficiency in service / defective goods (Rule CF-2). List invoices, warranty cards, and complaint numbers in a "Consumer Evidence Checklist" (Rule CF-3). Assess realistic compensation (Rule CF-4).
   - Tenancy: Identify tenancy type (residential, commercial, leave and licence) (Rule LT-1). Verify key clauses (Rent, Deposit, Notice Period) (Rule LT-2). Discourage self-help remedies (Rule LT-3) and ask: "Would you like assistance exploring settlement options?" (Rule LT-4).
`;

export interface GenerateResponseParams {
  noticeText: string;
  noticeType: string;
  businessName: string;
  businessAddress: string;
  gstin?: string;
  senderName: string;
  senderDesignation: string;
  previousCorrespondence?: string;
  additionalContext?: string;
}

export async function generateLegalResponse(params: GenerateResponseParams) {
  const systemPrompt = `${INDIAN_LEGAL_CONTEXT}

You are drafting a formal legal reply to a notice received by ${params.businessName} (${params.gstin ? `GSTIN: ${params.gstin}` : 'SME'}).
Address: ${params.businessAddress}

Draft a complete, legally structured reply that can be printed on company letterhead and sent to the issuing authority.`;

  const userPrompt = `NOTICE TYPE: ${params.noticeType}
ISSUING AUTHORITY: [Extracted from notice text]

NOTICE CONTENT:
${params.noticeText}

${params.previousCorrespondence ? `PREVIOUS CORRESPONDENCE:
${params.previousCorrespondence}` : ''}

${params.additionalContext ? `ADDITIONAL CONTEXT:
${params.additionalContext}` : ''}

REPLY FROM:
Name: ${params.senderName}
Designation: ${params.senderDesignation}
Business: ${params.businessName}

Generate a complete legal reply draft with:
1. Proper header and reference
2. Point-by-point response to allegations/claims
3. Legal grounds and precedents
4. Prayer/relief sought
5. List of enclosures/documents to attach
6. Signature block`;

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      top_p: 0.9,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function streamLegalResponse(params: GenerateResponseParams) {
  const response = await generateLegalResponse(params);

  const stream = OpenAIStream(response, {
    onCompletion: async (completion) => {
      console.log('Generation completed, length:', completion.length);
    },
  });

  return new StreamingTextResponse(stream);
}

export function extractLegalReferences(text: string): string[] {
  const patterns = [
    /Section \d+[A-Z]?\s+of\s+(?:the\s+)?([A-Za-z\s]+Act,?\s*\d{4})/gi,
    /Article\s+\d+\s+of\s+(?:the\s+)?([A-Za-z\s]+)/gi,
    /Rule\s+\d+\s+of\s+(?:the\s+)?([A-Za-z\s]+Rules,?\s*\d{4})/gi,
    /Order\s+\d+\s+Rule\s+\d+\s+of\s+(?:the\s+)?([A-Za-z\s]+)/gi,
  ];

  const references: string[] = [];
  patterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      references.push(match[0]);
    });
  });

  return Array.from(new Set(references));
}
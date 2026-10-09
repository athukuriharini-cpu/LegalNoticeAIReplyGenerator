export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  credits?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notice {
  id: string;
  userId?: string;
  title: string;
  noticeType: string;
  issuingBody?: string;
  noticeText: string;
  businessName?: string;
  businessAddress?: string;
  gstin?: string;
  senderName?: string;
  senderDesignation?: string;
  uploadedAt: Date | string;
  status: string;
  generatedResponse?: string | null;
  legalReferences?: string | null;
  lawyerReviewed?: boolean;
  lawyerNotes?: string | null;
  reviewStatus?: string;
  planUsed?: string;
}

export interface Payment {
  id: string;
  userId?: string;
  amount: number;
  status: string;
  createdAt?: Date;
}

export interface Subscription {
  id: string;
  userId?: string;
  plan: string;
  status: string;
  createdAt?: Date;
}

export type NoticeWithPayment = Notice & {
  payment?: Payment | null;
};

export type UserWithData = User & {
  notices: Notice[];
  subscriptions: Subscription[];
  payments: Payment[];
};

export interface GenerateRequestBody {
  noticeId: string;
  noticeType: string;
  noticeText: string;
  businessName: string;
  businessAddress: string;
  gstin?: string;
  senderName: string;
  senderDesignation: string;
  previousCorrespondence?: string;
  additionalContext?: string;
  plan: 'BASIC' | 'PREMIUM';
}

export interface GenerateResponseBody {
  success: boolean;
  notice: Notice;
  legalReferences: string[];
  wordCount: number;
}
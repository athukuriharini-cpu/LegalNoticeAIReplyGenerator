import { User, Notice, Payment, Subscription } from '@prisma/client';

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
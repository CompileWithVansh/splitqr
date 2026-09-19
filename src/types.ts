export interface UpiProfile {
  id: string;
  storeName: string;
  payeeName: string;
  primaryUpiId: string;
  secondaryUpiId?: string;
  splitThreshold: number; // default 1999
  splitStrategy: 'max' | 'balanced'; // 'max' chunks (1999s + remainder) vs 'balanced' equal portions
  multiAccountMode: boolean; // alternate chunks across primary and secondary UPI if enabled
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  pin?: string;
  createdAt: string;
}

export interface QrChunk {
  id: string;
  partNumber: number;
  totalParts: number;
  amount: number;
  upiId: string;
  payeeName: string;
  status: 'unpaid' | 'paid';
  paidAt?: string;
  qrDataUrl?: string;
  upiUrl: string;
}

export interface SplitSession {
  id: string;
  profileId: string;
  totalAmount: number;
  note?: string;
  createdAt: string;
  chunks: QrChunk[];
  isFullyPaid: boolean;
}

export interface TransactionRecord {
  id: string;
  profileId: string;
  totalAmount: number;
  note?: string;
  splitCount: number;
  createdAt: string;
  status: 'completed' | 'partial';
  chunksSummary: Array<{ amount: number; upiId: string; paid: boolean }>;
}

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  companyName: string | null;
  country: string | null;
  role: string;
  stripeCustomerId: string | null;
  wallet?: WalletState | null;
}

export interface WalletState {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  lifetimeSpentCents: number;
  lifetimeCreditsGranted: number;
  autoTopUpEnabled: boolean;
  autoTopUpThreshold: number;
  autoTopUpTierAmount: number;
  updatedAt: string;
}

export interface TransactionItem {
  id: string;
  walletId: string;
  type: string;
  status: string;
  amountCents: number;
  currency: string;
  creditsChange: number;
  balanceAfter: number;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  orderRef: string;
  description: string | null;
  createdAt: string;
}

export interface UsageLogItem {
  id: string;
  walletId: string;
  serviceName: string;
  serviceCategory: string;
  creditsCost: number;
  balanceAfter: number;
  executionTimeMs: number;
  status: string;
  payloadSnippet: string | null;
  createdAt: string;
}

export interface CreateIntentRequest {
  tierId: string;
  currency: "CAD" | "USD";
  customAmount?: number;
  userId?: string;
}

export interface CreateIntentResponse {
  clientSecret: string | null;
  paymentIntentId: string;
  amountCents: number;
  currency: string;
  creditsToAdd: number;
  orderRef: string;
  isMockMode?: boolean;
}

export interface AdjustCreditsRequest {
  userId: string;
  action: "SET_TO_ZERO" | "ADD_50K" | "CUSTOM_ADJUST";
  amount?: number; // delta or target
  reason?: string;
  adminSecret: string;
}

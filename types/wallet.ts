export type WalletInfo = {
  id: string;
  balance: number;
  currency: string;
  updatedat: string;
};

export type WalletData = {
  wallet: WalletInfo;
};

type AlatPayCheckout = {
  provided: string;
  script_url: string;
  api_key: string;
  business_id: string;
  business_name: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
};

export type WalletTransaction = {
  id?: string;
  amount?: number | string;
  type?: string;
  status?: string;
  createdat?: string;
  reference?: string;
  description?: string;
  [key: string]: unknown;
};

export type WalletTransactionsData = {
  data?: WalletTransaction[];
  items?: WalletTransaction[];
  page?: number;
  perPage?: number;
  total?: number;
  [key: string]: unknown;
};

export type WalletTopupData = {
  reference: string;
  transaction_id: string | null;
  amount: number;
  method: 'bank_transfer' | 'card' | string;
  status: 'pending' | string;
  bank_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
    reference: string;
    amount: number;
    expiresat: string;
  };
  authorization_url: string | null;
  checkout: AlatPayCheckout;
  message: string;
};

export type WalletVerifyTopupData = {
  amount: number;
  new_balance: number;
  reference: string;
  status: 'completed' | string;
  already_completed: boolean;
};


export type UiTransaction = {
  id: string;
  title: string;
  amount: string;
  status: 'Successful' | 'Completed' | 'Pending' | 'Processing' | 'Failed';
  type: 'credit' | 'debit';
  date: string;
  time: string;
  description?: string;
  balance?: string | number;
};


export type ReceiptParams = {
  transactionId?: string;
  title?: string;
  amount?: string;
  date?: string;
  time?: string;
  status?: string;
  type?: string;
  reference?: string;
  balance?: string;
  description?: string;
};

import { walletApi } from '@/src/config/api';
import { WalletTransaction } from '@/types/wallet';
import { formatAmount } from '@/utils/helper';
import { useQuery } from '@tanstack/react-query';
import { UiTransaction } from '@/types/wallet';


const statusFromRaw = (rawStatus?: string): UiTransaction['status'] => {
  const value = String(rawStatus ?? '').toLowerCase();
  if (value === 'completed' || value === 'success' || value === 'successful') return 'Successful';
  if (value === 'pending' || value === 'reserved') return 'Pending';
  return 'Failed';
};

const directionFromRaw = (raw: WalletTransaction): UiTransaction['type'] => {
  const type = String(raw.type ?? '').toLowerCase();
  const amount = Number(raw.amount ?? 0);

  if (type === 'debit') return 'debit';
  if (type === 'credit') return 'credit';
  return amount < 0 ? 'debit' : 'credit';
};

const displayDateTime = (rawDate?: string) => {
  const input = String(rawDate ?? '').trim();
  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    return { date: 'Unknown date', time: '--:--' };
  }

  const date = parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const time = parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { date, time };
};

const mapTransaction = (raw: WalletTransaction, index: number): UiTransaction => {
  const parsedAmount = Number(raw.amount ?? 0);
  const type = directionFromRaw(raw);
  const { date, time } = displayDateTime(raw.createdat);

  return {
    id: String(raw.id ?? raw.reference ?? `transaction-${index + 1}`),
    title: String(raw.description ?? raw.reference ?? 'Wallet transaction'),
    amount: formatAmount({ actual_amount: Math.abs(Number.isFinite(parsedAmount) ? parsedAmount : 0) }),
    status: statusFromRaw(raw.status),
    type,
    date,
    time,
  };
};

export const useWalletTransactions = (
  accesstoken: string | null,
) =>
  useQuery<UiTransaction[]>({
    queryKey: ['wallet-transactions', accesstoken],
    queryFn: async () => {
      const result = await walletApi.getWalletTransactions(accesstoken);

      
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to load transactions');
      }

      const rows = result.data?.data ?? result.data?.items ?? [];
      return rows.map(mapTransaction);
    },
    enabled: !!accesstoken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

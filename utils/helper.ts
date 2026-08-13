import type { RawOrder, UiOrder } from '@/types/order';
import { UiTransaction } from '@/types/wallet';
import { BASE_URL } from '@/src/config/api';
import { Linking } from 'react-native';

export const getPublicBaseUrl = () => {
  const rawBaseUrl = String(BASE_URL ?? '').trim().replace(/\/$/, '');
  if (!rawBaseUrl) {
    return '';
  }

  return rawBaseUrl.replace(/\/api(?:\/v\d+)?$/i, '');
};

export const openLink = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch (error) {
    
    console.warn('Failed to open link:', error);
  }
};

export const isSessionExpired = (result: any) =>
  !result?.success &&
  (
    result?.code === "SESSION_EXPIRED" ||
    result?.code === "AUTH_REFRESH_FAILED" ||
    (typeof result?.message === "string" &&
      result.message.toLowerCase().includes("session expired")) ||
    result?.message?.toLowerCase().includes("invalid refresh token") ||
    result?.message?.toLowerCase().includes("refresh token expired") ||
    result?.message?.toLowerCase().includes("invalid token")
  );

export const handleSessionExpired = async (
  result: any,
  logout: () => Promise<void>,
  replace: (path: string) => void
) => {
  if (!isSessionExpired(result)) return false;

  await logout();
  replace("(auth)/login");
  throw new Error('Session expired');
};

export const pullToRefresh = async (
  setRefreshing: (refreshing: boolean) => void,
  refreshAction: () => Promise<void>
) => {
  setRefreshing(true);
  try {
    await refreshAction();
  } finally {
    setRefreshing(false);
  }
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const formatCardNumber = (value: string) => {
  const digits = onlyDigits(value).slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

export const formatExpiry = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const formatCvv = (value: string) => onlyDigits(value).slice(0, 4);
export const formatPin = (value: string) => onlyDigits(value).slice(0, 4);

export function formatNaira(value: string) {
  // Remove all non-digits
  const cleanValue = value.replace(/\D/g, "");

  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const mapStatus = (rawStatus?: string): UiOrder['status'] => {
  const status = String(rawStatus ?? '').toLowerCase();

  if (status === 'pending' || status === 'pending_review') return 'Pending';
  if (status === 'draft') return 'Draft';
  if (status === 'completed' || status === 'delivered') return 'Completed';

  if (status === 'cancelled' || status === 'canceled') return 'Cancelled';
  return 'Active';
};

export const getStatusStyles = (status: UiTransaction['status']) => {
  switch (status) {
    case 'Successful':
    case 'Completed':
      return { bg: '#E6FFFA', text: '#38B2AC' };
    case 'Pending':
    case 'Processing':
      return { bg: '#FFFBEB', text: '#D69E2E' };
    case 'Failed':
    default:
      return { bg: '#FFF5F5', text: '#E53E3E' };
  }
};




const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatAmount = (rawOrder: RawOrder): string => {
  const amount = Number(
    rawOrder.payment_summary?.total ??
    rawOrder.estimatetotal ??
    rawOrder.finalamount ??
    rawOrder.estimated_amount ??
    rawOrder.actual_amount ??
    rawOrder.total_price ??
    0
  );
  return ngnFormatter.format(Number.isFinite(amount) ? amount : 0);
};


import { walletApi } from "@/src/config/api";
import type { WalletInfo } from "@/types/wallet";
import * as SecureStore from "expo-secure-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useAuth } from "./authcontext";

type WalletContextType = {
  balance: number | null;
  isWalletLoading: boolean;
  refreshWallet: () => Promise<void>;
};

const WALLET_STORAGE_KEY = "wallet";
const walletQueryKey = (token: string | null) => ['wallet', token] as const;

const WalletContext = createContext<WalletContextType | null>(null);

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const { accesstoken, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const walletQuery = useQuery<WalletInfo | null>({
    queryKey: walletQueryKey(accesstoken),
    queryFn: async () => {
      if (!accesstoken) {
        return null;
      }

      const result = await walletApi.getWallet(accesstoken);

      if (!result?.success) {
        throw new Error(result?.message || 'Failed to load wallet');
      }

      return result.data?.wallet ?? null;
    },
    enabled: !!accesstoken && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    let cancelled = false;

    const restoreWallet = async () => {
      if (!accesstoken || isAuthLoading) {
        return;
      }

      try {
        const rawWallet = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
        if (!rawWallet || cancelled) return;

        const parsed = JSON.parse(rawWallet) as Partial<WalletInfo>;
        const storedBalance = Number(parsed?.balance);

        if (!Number.isFinite(storedBalance)) {
          return;
        }

        const cachedWallet: WalletInfo = {
          id: String(parsed?.id ?? 'wallet-cache'),
          balance: storedBalance,
          currency: String(parsed?.currency ?? 'NGN'),
          updatedat: String(parsed?.updatedat ?? ''),
        };

        queryClient.setQueryData(walletQueryKey(accesstoken), (current) => current ?? cachedWallet);
      } catch {
        if (!cancelled) {
          queryClient.setQueryData(walletQueryKey(accesstoken), (current) => current ?? null);
        }
      }
    };

    void restoreWallet();

    return () => {
      cancelled = true;
    };
  }, [accesstoken, isAuthLoading, queryClient]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!accesstoken) {
      queryClient.removeQueries({ queryKey: ['wallet'] });
      SecureStore.deleteItemAsync(WALLET_STORAGE_KEY).catch(() => null);
      return;
    }

    const walletPayload = walletQuery.data;
    if (!walletPayload) return;

    SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(walletPayload)).catch(() => null);
  }, [accesstoken, isAuthLoading, queryClient, walletQuery.data]);

  const refreshWallet = useCallback(async () => {
    if (!accesstoken || isAuthLoading) {
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ['wallet'] });
  }, [accesstoken, isAuthLoading, queryClient]);

  const balance = walletQuery.data?.balance ?? null;
  const isWalletLoading = walletQuery.isLoading || walletQuery.isFetching;

  const value = useMemo(
    () => ({ balance, isWalletLoading, refreshWallet }),
    [balance, isWalletLoading, refreshWallet]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
};

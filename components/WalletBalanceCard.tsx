import { useAuth } from "@/app/context/authcontext";
import { appStyles, colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WalletBalanceCardProps = {
  balance: number | null;
  isBalanceVisible: boolean;
  isWalletLoading: boolean;
  onToggleBalanceVisible: () => void;
  onPressTransactionHistory: () => void;
  onPressTopUp: () => void;
};

export default function WalletBalanceCard({
  balance,
  isBalanceVisible,
  onToggleBalanceVisible,
  onPressTransactionHistory,
  onPressTopUp,
  isWalletLoading,
}: WalletBalanceCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const showTransactionPinNotice = user?.hastransactionpin === false;

  return (
    <View style={[appStyles.walletCard, styles.walletCard]}>
      <View style={styles.walletMainRow}>
        <View style={appStyles.walletBalanceInfo}>
          <View style={appStyles.walletLabelRow}>
            <Ionicons name="checkmark-circle" size={16} color="#48BB78" />
            <Text style={appStyles.walletLabelText}>Wallet Balance</Text>
            <TouchableOpacity onPress={onToggleBalanceVisible}>
              <Ionicons
                name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
                size={16}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {isWalletLoading ? (
            <View style={{ marginTop: 20, marginRight: "auto" }}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <Text style={appStyles.walletBalanceText}>
              {isBalanceVisible
                ? `₦ ${(balance ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "₦ * * * * *"}
            </Text>
          )}
        </View>

        <View style={appStyles.walletActions}>
          <TouchableOpacity
            style={appStyles.walletHistoryLink}
            onPress={onPressTransactionHistory}
            activeOpacity={0.85}
          >
            <Text style={appStyles.walletHistoryText}>Transaction History</Text>
            <Ionicons name="chevron-forward" size={12} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={appStyles.walletTopUpButton} onPress={onPressTopUp}>
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={appStyles.walletTopUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showTransactionPinNotice ? (
        <View style={styles.transactionPinNotice}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
          <Text style={styles.transactionPinNoticeText} numberOfLines={2}>
            Set your transaction PIN to secure payments.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/change-transaction-pin")}
            activeOpacity={0.85}
            style={styles.transactionPinNoticeCta}
          >
            <Text style={styles.transactionPinNoticeCtaText}>Set PIN</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  walletCard: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  walletMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionPinNotice: {
    width: "100%",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  transactionPinNoticeText: {
    flex: 1,
    color: colors.white,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },
  transactionPinNoticeCta: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexShrink: 0,
  },
  transactionPinNoticeCtaText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});

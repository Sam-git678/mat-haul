import WalletBalanceCard from "@/components/WalletBalanceCard";
import { appStyles, colors } from "@/constants";
import { useWalletTransactions } from "@/src/hooks/useWalletTransactions";
import { getStatusStyles } from '@/utils/helper';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { useWallet } from "../context/walletcontext";

export default function WalletScreen() {
  const router = useRouter();
  const { balance, isWalletLoading } = useWallet();
  const { accesstoken } = useAuth();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const { data: transactions = [], isLoading } = useWalletTransactions(accesstoken);
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <SafeAreaView style={appStyles.containerWhite} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={appStyles.homeContent}>
        <View style={appStyles.headerSection}>
          <Text style={appStyles.headerTitle}>Wallet</Text>
          <Text style={appStyles.headerSubtitle}>View your balance and activities related to your orders.</Text>
        </View>

        <WalletBalanceCard
          balance={balance}
          isBalanceVisible={isBalanceVisible}
          isWalletLoading={isWalletLoading}
          onToggleBalanceVisible={() => setIsBalanceVisible(!isBalanceVisible)}
          onPressTransactionHistory={() => router.push('/transaction-history')}
          onPressTopUp={() => router.push('/wallet-topup')}
        />

        <View style={appStyles.walletSectionHeader}>
          <Text style={appStyles.walletSectionTitle}>Recent Transactions</Text>
        </View>
      </View>

      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={appStyles.walletListContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const stylesStatus = getStatusStyles(item.status);
          return (
            <View style={appStyles.walletTransactionItem}>
              <View style={[appStyles.walletTransactionIconBox, { backgroundColor: item.type === 'credit' ? '#E6FFFA' : '#FFF5F5' }]}>
                <Ionicons
                  name={item.type === 'credit' ? "arrow-down" : "arrow-up"}
                  size={18}
                  color={item.type === 'credit' ? "#38B2AC" : "#E53E3E"}
                />
              </View>
              <View style={appStyles.walletTransactionMain}>
                <Text style={appStyles.walletTransactionTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={appStyles.walletTransactionDate}>{item.date} - {item.time}</Text>
              </View>
              <View style={appStyles.walletTransactionRight}>
                <Text style={[appStyles.walletTransactionAmount, { color: item.type === 'credit' ? '#38B2AC' : '#E53E3E' }]}>
                  {item.type === 'debit' ? '-' : '+'}{item.amount}
                </Text>
                <View style={[appStyles.walletStatusBadge, { backgroundColor: stylesStatus.bg }]}>
                  <Text style={[appStyles.walletStatusText, { color: stylesStatus.text }]}>{item.status}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#64748B' }}>No transactions yet.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

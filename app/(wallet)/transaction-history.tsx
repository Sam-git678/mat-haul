import SearchBox from '@/components/SearchBox';
import { appStyles, colors } from '@/constants';
import { useWalletTransactions } from '@/src/hooks/useWalletTransactions';
import { getStatusStyles, pullToRefresh } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'successful', label: 'Successful' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
] as const;

const BRAND_BLUE = '#0B4A8B';

type FilterKey = (typeof filters)[number]['key'];

export default function TransactionHistoryScreen() {
  const { accesstoken } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  

  const { data: transactions = [], isLoading, error, refetch } = useWalletTransactions(accesstoken);

  const onRefresh = useCallback(async () => {
    await pullToRefresh(setRefreshing, async () => {
      await refetch();
    });
  }, [refetch]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((tx) => {
      const matchesFilter = activeFilter === 'all' || tx.status.toLowerCase() === activeFilter;
      const matchesSearch =
        query.length === 0 ||
        tx.title.toLowerCase().includes(query) ||
        tx.amount.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search, transactions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={appStyles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={22} color={BRAND_BLUE} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={appStyles.headerTitle}>Transaction History</Text>
          <Text style={appStyles.headerSubtitle}>View your complete wallet activity in one place.</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <SearchBox placeholder="Search Transactions" onSearch={setSearch} />
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.primary}
            colors={[colors.primary]}
          />}
        ListHeaderComponent={
          <FlatList
            data={filters}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item }) => {
              const isActive = activeFilter === item.key;

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setActiveFilter(item.key)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color={BRAND_BLUE} />
                <Text style={styles.emptyText}>Loading transactions...</Text>
              </>
            ) : error ? (
              <>
                <Text style={styles.emptyTitle}>Could not load transactions</Text>
                <Text style={styles.emptyText}>{(error as Error).message}</Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>No transactions found</Text>
                <Text style={styles.emptyText}>Try a different search term or switch your filter.</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const statusStyles = getStatusStyles(item.status);

          return (
            <TouchableOpacity              
              activeOpacity={0.9}
              onPress={() => router.push({
                pathname: '/transaction-details',
                params: { 
                  transactionId: item.id,
                  title: item.title,
                  amount: item.amount,
                  date: item.date,
                  time: item.time,
                  type: item.type,
                  status: item.status,
                  balance: item.balance,
                  description: item.description,
                  
                 },
              })}
            >
              <View style={appStyles.walletTransactionItem}>
                <View
                  style={[
                    appStyles.walletTransactionIconBox,
                    { backgroundColor: item.type === 'credit' ? '#E6FFFA' : '#FFF5F5' },
                  ]}
                >
                  <Ionicons
                    name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                    size={18}
                    color={item.type === 'credit' ? '#38B2AC' : '#E53E3E'}
                  />
                </View>

                <View style={appStyles.walletTransactionMain}>
                  <Text style={appStyles.walletTransactionTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={appStyles.walletTransactionDate}>
                    {item.date} {'\u2022'} {item.time}
                  </Text>
                </View>

                <View style={appStyles.walletTransactionRight}>
                  <Text
                    style={[
                      appStyles.walletTransactionAmount,
                      { color: item.type === 'credit' ? '#38B2AC' : '#E53E3E' },
                    ]}
                  >
                    {item.type === 'debit' ? '-' : '+'}{item.amount}
                  </Text>
                  <View style={[appStyles.walletStatusBadge, { backgroundColor: statusStyles.bg }]}>
                    <Text style={[appStyles.walletStatusText, { color: statusStyles.text }]}>{item.status}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: appStyles.containerWhite,
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BRAND_BLUE,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  filterRow: {
   
    paddingBottom: 8,
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f9f2f1',
  },
  filterChipActive: {
    backgroundColor: '#E0E7FF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: BRAND_BLUE,
  },
  listContent: {
    paddingBottom: 40,
  },
  
  emptyState: {
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
  },
});

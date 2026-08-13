import SearchBox from '@/components/SearchBox';
import { appStyles, colors } from '@/constants';
import { orderApi } from '@/src/config/api';
import { GetOrdersData, UiOrder } from '@/types/order';
import { formatAmount, handleSessionExpired, mapStatus, pullToRefresh } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';







const filters = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

type FilterKey = (typeof filters)[number]['key'];

export default function OrderScreen() {
  const { accesstoken, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 15;




  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['orders', accesstoken],
    queryFn: async ({ pageParam = 1 }): Promise<GetOrdersData> => {
      const result = await orderApi.getOrders(accesstoken, { page: Number(pageParam), perPage: pageSize });
 
      
      await handleSessionExpired(
        result,
        logout,
        (path) => router.replace(path as any)
      )
      

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to load orders'
        );
      }
      return result.data ?? { data: [], pagination: undefined };
    },
    enabled: !!accesstoken,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (!pagination?.has_more) return undefined;
      return pagination.current_page + 1;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const onRefresh = useCallback(async () => {
    await pullToRefresh(
      setRefreshing,
      async () => {
        await refetch();
      }
    );
  }, [refetch]);

  const orders = useMemo<UiOrder[]>(() => {
    const rows = data?.pages.flatMap((page) => page?.data ?? []) ?? [];
    return rows.map((raw: any, index: number) => {
      const isTruckOrder =
        String(raw.ordertype ?? raw.order_type ?? '').toLowerCase() === 'vehicle_hire';

      return {
        id: String(raw.id ?? '').trim(),
        title:
          raw.productname ??
          raw.materialtype ??
          raw.material_type ??

          (isTruckOrder ? 'Truck Dispatch Request' : undefined) ??
          (raw.ordernumber ? `Order #${raw.ordernumber}` : `Order ${index + 1}`),
        location:
          raw.deliveryaddress ??
          raw.dropoff_address ??
          raw.delivery_location ??
          raw.pickup_address ??
          'No location',
        amount: formatAmount(raw),
        status: mapStatus(raw.status),
        rawStatus: String(raw.status ?? raw.paymentstatus ?? '').toLowerCase(),
        rawPaymentStatus: String(raw.paymentstatus ?? raw.payment_summary?.payment_status ?? '').toLowerCase(),
        rawOrderType: String(raw.ordertype ?? raw.order_type ?? '').toLowerCase(),
        isOpenable: Boolean(String(raw.id).trim()),
      };
    });
  }, [data?.pages]);

  const paginationMeta = data?.pages[data.pages.length - 1]?.pagination;
  const draftCount = useMemo(
    () => orders.filter((order) => order.rawStatus === 'draft').length,
    [orders]
  );




  const counts = useMemo(
    () => ({
      all: orders.filter((order) => order).length,
      active: orders.filter((order) => order.status === 'Active').length,
      pending: orders.filter((order) => order.status === 'Pending').length,
      completed: orders.filter((order) => order.status === 'Completed').length,
      cancelled: orders.filter((order) => order.status === 'Cancelled').length,
    }),
    [orders]
  );

  const completeOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {

      const matchesFilter =
        activeFilter === 'all' || order.status.toLowerCase() === activeFilter;
      const matchesSearch =
        query.length === 0 ||
        order.title.toLowerCase().includes(query) ||
        order.location.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, orders, search]);



  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={appStyles.homeContent}>
        <View style={appStyles.headerSection}>
          <Text style={appStyles.headerTitle}>Order</Text>
          <Text style={appStyles.headerSubtitle}>View and track all your material and truck orders from request to delivery..</Text>
        </View>

      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={{ paddingHorizontal: 16 }}>
          <SearchBox
            placeholder="Search"
            onSearch={setSearch}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          style={appStyles.ordersCard}
          onPress={() => router.push('/incomplete-orders')}
        >
          <View style={appStyles.ordersCardLeft}>
            <Text style={appStyles.ordersTitle}>Incomplete Orders</Text>
            <Text style={appStyles.ordersEmptyText}>
              {draftCount} draft {draftCount === 1 ? 'order' : 'orders'} to continue.
            </Text>
          </View>
          <View style={appStyles.ordersCardRight}>
            <Ionicons name="arrow-forward-circle-outline" size={24} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={appStyles.ordersFilterRow}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                activeOpacity={0.9}
                onPress={() => setActiveFilter(filter.key)}
                style={[appStyles.ordersFilterChip, isActive && appStyles.ordersFilterChipActive]}
              >
                <Text style={[appStyles.chipText, { fontSize: 14, color: '#667085' }, isActive && { color: '#0F172A' }]}>
                  {filter.label}
                </Text>
                <View style={[appStyles.ordersFilterCount, isActive && appStyles.ordersFilterCountActive]}>
                  <Text style={[appStyles.chipText, { fontSize: 14, color: '#475467' }, isActive && { color: colors.primary }]}>
                    {counts[filter.key]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={appStyles.ordersList}>
          {isLoading ? (
            <View style={appStyles.ordersEmptyState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={appStyles.ordersEmptyText}>Loading orders...</Text>
            </View>
          ) : error ? (
            <View style={appStyles.ordersEmptyState}>
              <Text style={appStyles.ordersEmptyTitle}>Could not load orders</Text>
              <Text style={appStyles.ordersEmptyText}>{(error as Error).message}</Text>
            </View>
          ) : completeOrders.length === 0 ? (
            <View style={appStyles.ordersEmptyState}>
              <Text style={appStyles.ordersEmptyTitle}>No orders found</Text>
              <Text style={appStyles.ordersEmptyText}>
                Try a different search or switch the order status above.
              </Text>
            </View>
          ) : (
            <>
              {completeOrders.map((order) => {
                const isActive = order.status === 'Active';
                const isPending = order.status === 'Pending';
                const statusIcon = isPending
                  ? 'time-outline'
                  : isActive
                    ? 'checkmark-circle-outline'
                    : 'checkmark-done-circle-outline';

                return (
                  <TouchableOpacity
                    key={`${order.id || 'missing-id'}-${order.title}-${order.location}`}
                    activeOpacity={order.isOpenable ? 0.92 : 1}
                    style={appStyles.ordersCard}
                    onPress={() => {
                      if (!order.isOpenable) return;

                      if (order.rawPaymentStatus === 'unpaid') {
                        

                        router.push({
                          pathname: '/estimate-summary',
                          params: {
                            source: "draft",
                            data: JSON.stringify({
                              draftId: order.id,
                              orderType: order.rawOrderType,
                              materialType: order.title,

                            }),


                          },
                        });
                        return;
                      }
                     

                      router.push({
                        pathname: '/order-details',
                        params: {
                          orderId: order.id,
                        },
                      });
                    }}
                  >
                    <View style={appStyles.ordersCardLeft}>
                      <Text style={appStyles.ordersTitle}>{order.title}</Text>
                      <View style={appStyles.ordersLocationRow}>
                        <Ionicons name="location-outline" size={18} color="#98A2B3" />
                        <Text style={appStyles.ordersLocationText}>{order.location}</Text>
                      </View>
                      {!order.isOpenable ? (
                        <Text style={[appStyles.ordersEmptyText, { marginTop: 6 }]}>Order details unavailable</Text>
                      ) : null}
                    </View>

                    <View style={appStyles.ordersCardRight}>
                      <View
                        style={[
                          appStyles.ordersStatusBadge,
                          isActive && appStyles.ordersStatusBadgeActive,
                          isPending && appStyles.ordersStatusBadgePending,
                          !isActive && !isPending && appStyles.ordersStatusBadgeCompleted,
                        ]}
                      >
                        <Ionicons
                          name={statusIcon}
                          size={16}
                          color={isActive ? '#12B76A' : isPending ? '#D97706' : colors.primary}
                        />
                        <Text
                          style={[
                            appStyles.ordersStatusText,
                            isActive && appStyles.ordersStatusTextActive,
                            isPending && appStyles.ordersStatusTextPending,
                            !isActive && !isPending && appStyles.ordersStatusTextCompleted,
                          ]}
                        >
                          {order.status}
                        </Text>
                      </View>

                      <Text style={appStyles.ordersAmount}>{order.amount}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {hasNextPage ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  style={[appStyles.ordersFilterChip, { alignSelf: 'center', marginTop: 8 }]}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={[appStyles.chipText, { color: '#0F172A' }]}>Load more orders</Text>
                  )}
                </TouchableOpacity>
              ) : paginationMeta ? (
                <Text style={[appStyles.ordersEmptyText, { textAlign: 'center', marginTop: 8 }]}>
                  End of list ({paginationMeta.total} total)
                </Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}

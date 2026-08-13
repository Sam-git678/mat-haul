import { appStyles, colors } from '@/constants';
import { orderApi } from '@/src/config/api';
import { UiOrder } from '@/types/order';
import { formatAmount, handleSessionExpired, mapStatus } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';

export default function IncompleteOrdersScreen() {
  const { accesstoken, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    router.prefetch({ pathname: '/products', params: { section: 'materials' } });
    router.prefetch({ pathname: '/products', params: { section: 'truck' } });
  }, [router]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const allRows: any[] = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore) {
        const result = await orderApi.getOrders(accesstoken, { page, perPage });

        
        if (await handleSessionExpired(result, logout, (path) => router.replace(path as any))) return;

        if (!result?.success) {
          setOrders([]);
          return;
        }

        const rows = result.data?.data ?? [];
        allRows.push(...rows);

        const pagination = result.data?.pagination;
        hasMore = Boolean(pagination?.has_more);
        page += 1;
      }

      if (allRows.length > 0) {
        const mapped: UiOrder[] = allRows.map((raw, index) => {
          const isTruckOrder = String(raw.ordertype ?? raw.order_type ?? '').toLowerCase() === 'vehicle_hire';
          return {
            id: String(raw.id ?? '').trim(),
            title:
              raw.productname ??
              raw.materialtype ??
              
              (isTruckOrder ? 'Truck Dispatch Request' : undefined) ??
              (raw.ordernumber ? `Order #${raw.ordernumber}` : `Order ${index + 1}`),
            location:
              raw.deliveryaddress ??
              raw.dropoff_address ??
              raw.delivery_location ??
              raw.pickup_address ??
              'No location',
            scheduledPickupDate: raw.scheduled_pickup_date,
            deliveryNote: raw.delivery_notes,
            deliveryDistance: raw.deliverydistancekm,
            pricingMode: raw.pricing_mode,
            amount: formatAmount(raw),
            status: mapStatus(raw.status),
            rawStatus: String(raw.status ?? '').toLowerCase(),
            rawPaymentStatus: String(raw.paymentstatus ?? raw.payment_summary?.payment_status ?? '').toLowerCase(),
            rawOrderType: String(raw.ordertype ?? raw.order_type ?? '').toLowerCase(),
            isOpenable: Boolean(String(raw.id).trim()),
          };
        });
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accesstoken, logout, router]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const incompleteOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.rawStatus === 'draft' || order.rawPaymentStatus === 'unpaid'
      ),
    [orders]
  );

  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={appStyles.pageHeaderBetween}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.circleIconButton}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Incomplete Orders</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {isLoading ? (
          <View style={appStyles.ordersEmptyState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={appStyles.ordersEmptyText}>Loading incomplete orders...</Text>
          </View>
        ) : incompleteOrders.length === 0 ? (
          <View style={appStyles.ordersEmptyState}>
            <Text style={appStyles.ordersEmptyTitle}>No incomplete orders</Text>
            <Text style={appStyles.ordersEmptyText}>Start a material or truck order with the button below.</Text>
          </View>
        ) : (
          <View style={appStyles.ordersList}>
            {incompleteOrders.map((order) => {
              return (
              <TouchableOpacity
                key={`${order.id}-${order.title}`}
                activeOpacity={0.92}
                style={appStyles.ordersCard}
                onPress={() => {
                  
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
                }}
              >
                <View style={appStyles.ordersCardLeft}>
                  <Text style={appStyles.ordersTitle}>{order.title}</Text>
                  <View style={appStyles.ordersLocationRow}>
                    <Ionicons name="location-outline" size={18} color="#98A2B3" />
                    <Text style={appStyles.ordersLocationText}>{order.location}</Text>
                  </View>
                </View>
                <View style={appStyles.ordersCardRight}>
                  <View style={[appStyles.ordersStatusBadge, appStyles.ordersStatusBadgeCompleted]}>
                    <Ionicons name="checkmark-done-circle-outline" size={16} color={colors.primary} />
                    <Text style={[appStyles.ordersStatusText, appStyles.ordersStatusTextCompleted]}>Draft</Text>
                  </View>
                  <Text style={appStyles.ordersAmount}>{order.amount}</Text>
                </View>
              </TouchableOpacity>
              );
            })}

            
          </View>
        )}
      </ScrollView>

      {showQuickActions ? (
        <View style={[styles.quickActions, { bottom: insets.bottom + 92 }]}>
          <TouchableOpacity
            style={styles.quickActionItem}
            activeOpacity={0.9}
            onPress={() => {
              router.push({ pathname: '/products', params: { section: 'materials' } });
            }}
          >
            <Text style={styles.quickActionText}>Material</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            activeOpacity={0.9}
            onPress={() => {
              router.push({ pathname: '/products', params: { section: 'truck' } });
            }}
          >
            <Text style={styles.quickActionText}>Truck</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.92}
        style={[styles.startButton, { bottom: insets.bottom + 24 }]}
        onPress={() => setShowQuickActions((prev) => !prev)}
      >
        <Text style={styles.startButtonText}>{showQuickActions ? 'Close' : 'Start New Order'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  startButton: {
    position: 'absolute',
    right: 20,
    minWidth: 148,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  quickActions: {
    position: 'absolute',
    right: 20,
    gap: 10,
  },
  quickActionItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 120,
  },
  quickActionText: {
    color: '#101828',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
  },
});

import OrderMediaPreview from '@/components/OrderMediaPreview';
import { SummaryRow } from '@/components/SummaryRows';
import { appStyles, colors } from '@/constants';
import { orderApi } from '@/src/config/api';
import { OrderMediaFile } from '@/types/media';
import { RawOrder } from '@/types/order';
import { handleSessionExpired } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';

type OrderDetailsParams = {
  id: string;
  orderType: 'materials' | 'vehicle_hire';
  title: string;
  materialType: string;
  truckType?: string;
  capacityTons?: string;
  location: string;
  pickupLocation: string;
  deliveryLocation: string;
  finalCost?: string;
  totalprice?: number | string;
  total_price?: number | string;
  amount?: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Cancelled';
  rawStatus: string;
  isPaid: boolean;
  paymentStatus: string;
  orderDate: string;
  pricingMode: string;
  estimatedQuantityRange: string;
  truckSize: string;
  truckCount: number;
  cargoDescription: string;
  deliveryNotes?: string;
  deliveryDistance: string;
  materialCost: string;
  deliveryCost: string;
  mediaFiles?: OrderMediaFile[];
};

const defaultOrder: OrderDetailsParams = {
  id: '-',
  orderType: 'materials',
  title: 'Order',
  materialType: '-',
  location: 'No location',
  pickupLocation: '-',
  deliveryLocation: '-',
  finalCost: 'N0',
  status: 'Pending',
  rawStatus: '',
  isPaid: false,
  paymentStatus: 'unpaid',
  orderDate: '-',
  pricingMode: 'Per Ton (Weight-Based)',
  estimatedQuantityRange: '-',
  truckSize: '-',
  truckCount: 0,
  cargoDescription: '-',
  deliveryNotes: '-',
  deliveryDistance: '-',
  materialCost: 'N0',
  deliveryCost: 'N0',
  mediaFiles: [],
};

export default function OrderDetailsScreen() {
  const { accesstoken, logout } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();

  

  const orderId = typeof params.orderId === 'string' ? params.orderId : '';


  const ngnFormatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const mapStatus = (rawStatus?: string): OrderDetailsParams['status'] => {
    const status = String(rawStatus ?? '').toLowerCase();
    if (status === 'pending' || status === 'draft') return 'Pending';
    if (status === 'completed' || status === 'delivered') return 'Completed';
    if (status === 'cancelled' || status === 'canceled') return 'Cancelled';
    return 'Active';
  };

  const mapPricingMode = (rawMode?: string): string => {
    const mode = String(rawMode ?? '').toLowerCase();
    if (mode === 'per_ton' || mode === 'per ton') return 'Per Ton (Weight-Based)';
    if (mode === 'per_truck' || mode === 'per truck') return 'Per Truck (Fixed)';
    return 'Per Ton (Weight-Based)';
  };

  const formatDate = (rawDate?: string): string => {
    if (!rawDate) return '-';
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatPlainNaira = (value?: number | string): string => {
    const amount = Number(value ?? 0);
    return ngnFormatter.format(Number.isFinite(amount) ? amount : 0);
  };

  const normalizeMediaFiles = (value: unknown): OrderMediaFile[] => {
    const parseCandidate = (candidate: unknown): OrderMediaFile | null => {
      if (!candidate || typeof candidate !== 'object') return null;
      const item = candidate as Record<string, unknown>;
      const uri = String(item.uri ?? item.url ?? item.path ?? '').trim();
      if (!uri) return null;

      const mimeType = String(item.mimeType ?? item.mime_type ?? item.type ?? '').trim();
      const isVideo = mimeType.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(uri);

      return {
        uri,
        name: String(item.name ?? item.filename ?? item.file_name ?? uri.split('/').pop() ?? 'Media'),
        mimeType: mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
        mediaType: isVideo ? 'video' : 'image',
        size: typeof item.size === 'number' ? item.size : undefined,
      };
    };

    if (Array.isArray(value)) {
      return value.map(parseCandidate).filter((item): item is OrderMediaFile => item !== null);
    }

    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) return [];

      try {
        return normalizeMediaFiles(JSON.parse(raw));
      } catch {
        const isVideo = /\.(mp4|mov|m4v|webm)$/i.test(raw);
        return [{
          uri: raw,
          name: raw.split('/').pop() ?? 'Media',
          mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
          mediaType: isVideo ? 'video' : 'image',
        }];
      }
    }

    const single = parseCandidate(value);
    return single ? [single] : [];
  };

 
  const orderDetailsQueryKey = (
    orderId: string,
    accesstoken: string | null
  ) =>
  ['order-details', orderId, accesstoken] as const;

  const fetchOrderDetails = async (
    orderId: string, 
    accesstoken: string | null
  ) => {
    const result = await orderApi.getOrderDetails(orderId, accesstoken);
    await handleSessionExpired(result, logout, (path) => router.replace(path as any));

    if (!result?.success) {
      throw new Error(
        result?.message || 'Failed to load order details'
      );
    }

    const raw: RawOrder = result.data?.order ?? {};

    const items = Array.isArray(raw.items) ? raw.items : [];
    const media = Array.isArray(raw.media) ? raw.media : [];
    const statusHistory = Array.isArray(raw.status_history) ? raw.status_history : [];
    
    const isTruckOrder = String(raw.ordertype ?? '').toLowerCase() === 'vehicle_hire'; 

    const mapped: OrderDetailsParams = {
      id: raw.ordernumber ?? '-',
      orderType: isTruckOrder ? 'vehicle_hire' : 'materials',
      title: isTruckOrder ? "Truck Dispatch Request" : "Material Request",
      materialType: raw.productname ?? '-',
      truckType: raw.productname ?? '-',
      location: raw.deliveryaddress ??  '-',
      pickupLocation: raw.pickup_address ?? raw.pickup_location ?? '-',
      deliveryLocation: raw.deliveryaddress ?? '-',
      status: mapStatus(raw.status) ?? '-',
      rawStatus: raw.paymentstatus ?? '',
      paymentStatus: raw.paymentstatus ?? '-',
      isPaid: raw.paymentstatus === 'paid',
      orderDate: formatDate(raw.createdat) ?? '-',
      pricingMode: mapPricingMode(raw.pricingmode ?? raw.pricing_mode) ?? '-',
      estimatedQuantityRange: raw.expectedtotaltonnage ? `${raw.expectedtotaltonnage} tons` : '-',
      truckSize: raw.truck_size ?? '-',

      truckCount: raw.unitcount ?? 0,

      deliveryDistance: raw.distancekm ? `${raw.distancekm} km` : '-',
      cargoDescription: raw.cargo_description ?? '-',
      deliveryNotes: raw.notes ?? '-',
      materialCost: formatPlainNaira(raw.payment_summary?.material_cost ?? raw.material_cost),
      deliveryCost: formatPlainNaira(raw.payment_summary?.delivery_cost ?? raw.delivery_cost ?? raw.deliverycost),
      finalCost: formatPlainNaira(raw.payment_summary?.total ?? raw.total_price ?? raw.finalamount ?? raw.estimatetotal),

      capacityTons: raw.capacitytons ? `${raw.capacitytons} tons` : '-',
      mediaFiles: normalizeMediaFiles(media),
    };
    return mapped;


  };

  const {
    data: order = defaultOrder,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
 } = useQuery<OrderDetailsParams>({
    queryKey: orderDetailsQueryKey(orderId, accesstoken),
    queryFn: () => fetchOrderDetails(orderId, accesstoken),
    enabled: !!accesstoken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  
  
  const estimatedCost = order.finalCost;
  const canViewReceipt = false;
  const canPay = order.rawStatus === 'approved';

  const isActive = order.status === 'Active';
  const isPending = order.status === 'Pending';
  const statusIcon = isPending
    ? 'time-outline'
    : isActive
      ? 'checkmark-circle-outline'
      : 'checkmark-done-circle-outline';
  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={appStyles.orderDetailsHeader}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Order Details</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <ScrollView contentContainerStyle={appStyles.orderDetailsScroll}>
        
        {isLoading ? (
          <View style={appStyles.ordersEmptyState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={appStyles.ordersEmptyText}>Loading order details...</Text>
          </View>
        ) : isError ? (
          <View style={appStyles.ordersEmptyState}>
            <Text style={appStyles.ordersEmptyTitle}>Could not load order details</Text>
            <Text style={appStyles.ordersEmptyText}>{(error as Error).message}</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={[appStyles.submitButtonRounded, { marginTop: 14 }]}
            >
              <Text style={appStyles.submitButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
        <View style={appStyles.summaryCard}>
          <View style={appStyles.summaryLocationRow}>
            <View style={appStyles.summaryMapIconWrap}>
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            </View>
            <View style={appStyles.summaryLocationTextWrap}>
              <Text style={appStyles.summaryLocationName}>{order.title}</Text>
              <View style={appStyles.summaryAddressRow}>
                <Ionicons name="location" size={14} color="#757575" />
                <Text style={appStyles.summaryAddressText}>{order.location}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={appStyles.summaryCard}>
          <Text style={appStyles.summaryCardHeader}>Order Summary</Text>
          <View style={appStyles.divider} />
          <SummaryRow label="Order ID" value={order.id} />
          <SummaryRow label="Order Date" value={order.orderDate} />
          <View style={appStyles.summaryRow}>
            <Text style={appStyles.summaryRowLabel}>Order Status</Text>
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
          </View>
        </View>

        <OrderMediaPreview
          files={order.mediaFiles ?? []}
          title="Media"
          subtitle="This media is loaded from the backend order record."
        />

        {order.orderType === 'vehicle_hire' ? (
          <>
            <View style={appStyles.summaryCard}>
              <Text style={appStyles.summaryCardHeader}>Truck & Route</Text>
              <View style={appStyles.divider} />
              <SummaryRow label="Truck Type" value={String(order.truckType)} />
              <SummaryRow label="Number of Trucks" value={String(order.truckCount)} />
              <SummaryRow label="Capacity Tons" value={String(order.capacityTons)} />
              <SummaryRow label="Pickup Location" value={order.pickupLocation} />
              <SummaryRow label="Delivery Location" value={order.deliveryLocation} />
              {/* <SummaryRow label="Cargo Description" value={order.cargoDescription} /> */}
              <SummaryRow label="Route Distance" value={order.deliveryDistance} />
              <SummaryRow label="Delivery Note" value={String(order.deliveryNotes)} />
            </View>

            <View style={appStyles.summaryCard}>
              <Text style={appStyles.summaryCardHeader}>Cost Breakdown</Text>
              <View style={appStyles.divider} />
              <SummaryRow label="Distance Cost" value={'-'} />
              <View style={appStyles.summaryTotalRow}>
                <Text style={appStyles.summaryTotalLabel}>Estimated Cost</Text>
                <Text style={appStyles.summaryTotalValue}>{order.finalCost}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={appStyles.summaryCard}>
              <Text style={appStyles.summaryCardHeader}>Material & Pricing</Text>
              <View style={appStyles.divider} />
              <SummaryRow label="Material Type" value={order.materialType} />
              <SummaryRow label="Pricing Mode" value={order.pricingMode} />
              <SummaryRow label="Quantity" value={order.estimatedQuantityRange} />
              <SummaryRow label="Delivery Distance" value={order.deliveryDistance} />
            </View>

            <View style={appStyles.summaryCard}>
              <Text style={appStyles.summaryCardHeader}>Cost Breakdown</Text>
              <View style={appStyles.divider} />
              <SummaryRow label="Material Cost" value={order.materialCost} />
              <SummaryRow label="Delivery Cost" value={order.deliveryCost} />
              <View style={appStyles.summaryTotalRow}>
                <Text style={appStyles.summaryTotalLabel}>Estimated Cost</Text>
                <Text style={appStyles.summaryTotalValue}>{order.finalCost}</Text>
              </View>
            </View>
          </>
        )}
        
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/order-receipt',
              params: {
                orderId: order.id,
                title: order.title,
                amount: order.amount,
                orderDate: order.orderDate,
                status: order.status,
                orderType: order.orderType,
              },
            })
          }
          disabled={!canViewReceipt}
          style={[
            appStyles.submitButtonRounded,
            !canViewReceipt && appStyles.buttonDisabled,
            { marginTop: 8 },
          ]}
        >
          <Text style={appStyles.submitButtonText}>View Receipt</Text>
        </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

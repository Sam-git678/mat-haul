import PaymentModal from '@/components/PaymentModal';
import PinModal from '@/components/PinModal';
import OrderMediaPreview from '@/components/OrderMediaPreview';
import { EstimatePayload } from '@/types/order';

import { SummaryRow } from '@/components/SummaryRows';
import { appStyles, colors } from '@/constants';
import { orderApi } from '@/src/config/api';
import { OrderMediaFile } from '@/types/media';
import { AlatPayPaymentData, OrderRequest } from '@/types/order';
import { handleSessionExpired } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';



const BRAND_BLUE = '#0B4A8B';
const isTruckOrder = (order: any): boolean => order?.orderType === 'vehicle_hire';
const isMaterialOrder = (order: any): boolean => order?.orderType === 'materials';

const LOAD_TYPE_TONNAGE: Record<string, number> = {
  FULL_LOAD: 30,
  ONE_BULK_BAG: 1,
  HALF_BULK_BAG: 0.5,
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const materialQuantityTons = (order: any): number => {
  const raw = toNumber(order.quantityTons);
  if (order?.pricingMode !== 'per_truck') return raw;

  const capacity = LOAD_TYPE_TONNAGE[order?.loadType ?? ''] ?? 0;
  return raw * capacity;
};

const materialUnitCount = (order: any): number | null => {
  if (order?.pricingMode !== 'per_truck') return null;
  return toNumber(order.quantityTons);
};


const getMeasurementType = (order: any) => {
  if (order?.pricingMode === 'per_truck') {

    if (order?.loadType === 'FULL_LOAD') return 'Full Truck';
    if (order?.loadType === 'ONE_BULK_BAG') return 'bulk';
    if (order?.loadType === 'HALF_BULK_BAG') return 'halfbulk';

    return 'Truck';
  }
  return 'Ton';
};

const mapMaterialNaming = (order: any) => ({
  // Keep distance aliases to match varying backend field names.
  distance_km: order.distanceKm ?? order.distancekm,
  deliverydistancekm: order.distanceKm ?? order.distancekm,
  delivery_distance_km: order.distanceKm ?? order.distancekm,
  pricingmode: order.pricingMode,

  loadtype: order.loadType ?? null,
  unitcount: materialUnitCount(order),

  deliveryaddress: order.deliveryAddress ?? order.deliveryaddress,
  deliverylatitude: order.deliveryLatitude,
  deliverylongitude: order.deliveryLongitude,
  delivery_contact_person: order.deliveryContactPerson,
  delivery_contact_phone: order.deliveryPhone ?? order.deliveryContactPhone,
  delivery_phone: order.deliveryPhone ?? order.deliveryContactPhone,
  quarryid: order.quarryId ?? order.quarryid,
  scheduled_date: order.scheduledDate,
  delivery_notes: order.deliveryNotes,
  distancekm: order.distanceKm ?? order.distancekm,
  items: [
    {
      productid: order.productId,
      quantitytons: materialQuantityTons(order),


    },
  ],
});

const mapMaterialEstimateNaming = (order: any) => ({


  pricingmode: order.pricingMode,
  loadtype: order.loadType ?? null,
  unitcount: materialUnitCount(order),
  delivery_contact_person: order.deliveryContactPerson,
  delivery_contact_phone: order.deliveryPhone ?? order.deliveryContactPhone,
  delivery_phone: order.deliveryPhone ?? order.deliveryContactPhone,
  quarryid: order.quarryId ?? order.quarryid,
  distancekm: order.distanceKm ?? order.distancekm,

  items: [
    {
      productid: order.productId,
      quantitytons: materialQuantityTons(order),

    },
  ],

});

const mapTruckNaming = (order: any) => ({


  truckcount: order.numberOfTrucks,
  vehicletypeid: order.vehicleTypeId,
  truckcategory: order.truckCategory,
  goods_type: order.goodsType,
  pickup_location_id: order.pickupLocationId,
  unitcount: order.numberOfTrucks,
  pickup_location: order.pickupLocation,
  pickup_address: order.pickupLocation,
  pickup_contact_person: order.pickupContactPerson,
  pickup_phone: order.pickupPhone ?? order.pickupPhoneNumber,
  pickup_latitude: order.pickupLatitude,
  pickup_longitude: order.pickupLongitude,
  pickup_date: order.pickupDate,
  delivery_location: order.deliveryLocation,
  dropoff_address: order.deliveryLocation,
  dropoff_latitude: order.deliveryLatitude,
  dropoff_longitude: order.deliveryLongitude,
  delivery_contact_person: order.deliveryContactPerson,
  delivery_phone: order.deliveryPhone ?? order.deliveryContactPhone,
  delivery_contact_phone: order.deliveryPhone ?? order.deliveryContactPhone,
  deliverylatitude: order.deliveryLatitude,
  deliverylongitude: order.deliveryLongitude,
  distancekm: order.deliveryDistancekm ?? order.pickupDistancekm ?? order.distancekm,
  distance_km: order.deliveryDistancekm ?? order.pickupDistancekm ?? order.distancekm,
  deliverydistancekm: order.deliveryDistancekm ?? order.pickupDistancekm ?? order.distancekm,
  delivery_distance_km: order.deliveryDistancekm ?? order.pickupDistancekm ?? order.distancekm,
  route_distance_km: order.deliveryDistancekm ?? order.pickupDistancekm ?? order.distancekm,
  scheduled_date: order.dispatchDate,
  cargo_description: order.cargoDescription,
  notes: order.deliveryNotes,
});

const mapPayloadNaming = (order: OrderRequest) => (isTruckOrder(order)
  ? mapTruckNaming(order)
  : isMaterialOrder(order)
    ? mapMaterialNaming(order)
    : mapMaterialEstimateNaming(order));


const toFiniteNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const firstValue = (...values: unknown[]) => values.find((value) => value !== null && value !== undefined && value !== '');
const textValue = (...values: unknown[]) => {
  const value = firstValue(...values);
  if (value === null || value === undefined) return '-';
  const text = String(value).trim();
  return text || '-';
};

const inferMediaType = (mimeType?: string, uri?: string): 'image' | 'video' => {
  const mime = String(mimeType ?? '').toLowerCase();
  const fileUri = String(uri ?? '').toLowerCase();
  if (mime.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(fileUri)) {
    return 'video';
  }
  return 'image';
};

const normalizeMediaFiles = (value: unknown): OrderMediaFile[] => {
  const parseCandidate = (candidate: unknown): OrderMediaFile | null => {
    if (!candidate || typeof candidate !== 'object') return null;
    const item = candidate as Record<string, unknown>;
    const uri = String(firstValue(item.uri, item.url, item.path) ?? '').trim();
    if (!uri) return null;

    const mimeType = String(firstValue(item.mimeType, item.mime_type, item.type) ?? '').trim();
    const mediaType = inferMediaType(mimeType, uri);

    return {
      uri,
      name: String(firstValue(item.name, item.filename, item.file_name) ?? uri.split('/').pop() ?? 'Media'),
      mimeType: mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
      mediaType,
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
      const parsed = JSON.parse(raw);
      return normalizeMediaFiles(parsed);
    } catch {
      const mediaType = inferMediaType(undefined, raw);
      return [{
        uri: raw,
        name: raw.split('/').pop() ?? 'Media',
        mimeType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        mediaType,
      }];
    }
  }

  const single = parseCandidate(value);
  return single ? [single] : [];
};

const truckCategoryOptions = [
  { value: 'tipper', label: 'Tipper' },
  { value: 'lorry', label: 'Lorry' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'containercarrier', label: 'Container Carrier' },
  { value: 'other', label: 'Other' },
] as const;

const goodsTypeOptions = [
  { value: 'building_materials', label: 'Building Materials' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'household_goods', label: 'Household Goods' },
  { value: 'commercial_goods', label: 'Commercial Goods' },
  { value: 'agricultural_goods', label: 'Agricultural Goods' },
  { value: 'other', label: 'Other Goods' },
] as const;

const formatTruckCategory = (value?: string) =>
  truckCategoryOptions.find((option) => option.value === value)?.label ?? textValue(value);

const formatGoodsType = (value?: string) =>
  goodsTypeOptions.find((option) => option.value === value)?.label ?? textValue(value);

type MappedEstimate = {
  materialType?: string;
  pricingMode?: string;
  quantityTons?: number;
  loadType?: string;
  deliveryLocation?: string;
  truckSize?: string;
  numberOfTrucks?: number;
  pickupLocation?: string;
  truckCategory?: string;
  goodsType?: string;
  deliveryNotes?: string;
  scheduledDate?: string;
  pickupDate?: string;
  serviceCost?: number | null;
  estimatedCost: number | null;
  distanceCost?: number | null;
  materialCost?: number | null;
  deliveryCost?: number | null;
  capacityTons?: number | null;
  distanceKm: number | null;
  perkmCost?: number | null;
  pickupContactPerson?: string;
  pickupPhoneNumber?: string;
  pickupPhone?: string;
  deliveryContactPerson?: string;
  deliveryPhone?: string;
  deliveryContactPhone?: string;
  dispatchDate?: string;
  cargoDescription?: string;
  mediaFiles?: OrderMediaFile[];
};



const defaultEstimateSummary: MappedEstimate = {
  estimatedCost: null,
  distanceCost: null,
  materialCost: null,
  deliveryCost: null,
  capacityTons: null,
  distanceKm: null,
};








export default function EstimateSummaryScreen(
  {visible, onClose,}: {visible: boolean; onClose: () => void;}) {
  const { accesstoken, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEstimateLoading, setIsEstimateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimateSummary, setEstimateSummary] = useState<MappedEstimate>(defaultEstimateSummary);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState(false);
  const [paymentData, setPaymentData] = useState<AlatPayPaymentData | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
 
 

  const { data, source } = useLocalSearchParams();

  let parsedOrder: OrderRequest | null = null;


  switch (source) {
    case "draft":

      try {
        const payload = data ? JSON.parse(data as string) : null;
        if (payload) {
          parsedOrder = payload as OrderRequest;


        }
      } catch {
        parsedOrder = null;
      }

      break;

    case "new-order":
      try {
        const payload = data ? JSON.parse(data as string) : null;
        if (
          payload &&
          (
            payload.orderType === 'materials' ||
            payload.orderType === 'vehicle_hire' ||
            payload.orderType === 'estimate'
          )
        ) {
          parsedOrder = payload as OrderRequest;



        }
      } catch {
        parsedOrder = null;

      }

      break;

    default:
      console.log('no source');
  }

  useEffect(() => {

    let isMounted = true;

    const loadEstimate = async () => {

      if (!accesstoken || !parsedOrder) return;


      setIsEstimateLoading(true);
      setError(null);



      let estimateResult: any;
      if (source === "draft") {
        const draftId = (parsedOrder as EstimatePayload).draftId;
        if (!draftId) return;
        estimateResult = await orderApi.getOrderDetails(draftId, accesstoken); 

      } else if (parsedOrder.orderType == 'materials') {
        const estimatePayload = mapMaterialEstimateNaming(parsedOrder);
        

        estimateResult = await orderApi.getMaterialEstimate(estimatePayload as any, accesstoken);
       



      } else if (parsedOrder.orderType === 'vehicle_hire') {
        const truckPayload = mapTruckNaming(parsedOrder);
        estimateResult = await orderApi.getTruckEstimate(truckPayload as any, accesstoken);

      } else {
        setError('Invalid order type for estimation.');
        setIsEstimateLoading(false);
        return;
      }

      if (!isMounted) return;


      if (estimateResult?.success) {
       
        const fetchedOrderId = String((estimateResult as any)?.data?.order?.id ?? '').trim();
        if (source === "draft") {
          setOrderId(fetchedOrderId);
        }

        const rawEstimate = estimateResult.data ?? {};
        const draftOrder = (rawEstimate as any)?.order ?? {};
        const draftItem = Array.isArray(draftOrder.items)
          ? draftOrder.items[0] ?? {}
          : (draftOrder.items ?? {});
        const mapped: MappedEstimate =

          source === "draft" ? {
            
            materialType:
              draftOrder.productname ??
              draftOrder.vehicle_type_name ??
              draftItem.product_name,
            pricingMode: draftOrder.pricing_mode ?? draftOrder.pricingmode,
            quantityTons: toFiniteNumber(
              firstValue(
                draftOrder.estimatedtonnage,
                draftOrder.expectedtotaltonnage,
                draftItem.quantity,
                draftOrder.items?.quantity
              )
            ) ?? undefined,
            loadType: draftOrder.loadtype,
            deliveryLocation: draftOrder.deliveryaddress ?? draftOrder.delivery_location,
            distanceKm:
              toFiniteNumber(draftOrder.deliverydistancekm ??
                draftOrder.distancekm),
            scheduledDate:
              String(
                firstValue(
                  draftOrder.scheduled_date,
                  draftOrder.scheduled_pickup_date,
                  draftOrder.deliverydate
                ) ?? ''
              ) || undefined,
            truckSize: draftOrder.load_type_label ?? draftOrder.vehicle_type_name ?? draftItem.truck_size,
            truckCategory: String(firstValue(
              draftOrder.truck_category,
              draftOrder.truckcategory
            ) ?? '') || undefined,
            goodsType: String(firstValue(
              draftOrder.goods_type,
              draftOrder.goodstype
            ) ?? '') || undefined,
            capacityTons: toFiniteNumber(draftOrder.capacitytons) ?? undefined,
            numberOfTrucks: toFiniteNumber(draftOrder.unitcount) ?? undefined,
            pickupLocation:
              draftOrder.pickup_location ??
              draftOrder.pickup_address,
            pickupContactPerson: draftOrder.pickup_contact_person,
            pickupPhoneNumber: draftOrder.pickup_phone,
            pickupPhone: draftOrder.pickup_phone,
            pickupDate: String(firstValue(
              draftOrder.pickup_date,
              draftOrder.pickupDate,
              draftOrder.scheduled_pickup_date
            ) ?? '') || undefined,
            dispatchDate: draftOrder.scheduled_date,
            deliveryContactPerson: String(firstValue(
              draftOrder.delivery_contact_person,
              draftOrder.deliveryContactPerson
            ) ?? '') || undefined,
            deliveryPhone: String(firstValue(
              draftOrder.delivery_phone,
              draftOrder.deliveryPhone,
              draftOrder.delivery_contact_phone,
              draftOrder.deliveryContactPhone
            ) ?? '') || undefined,
            cargoDescription: draftOrder.notes,
            deliveryNotes:
              String(
                firstValue(
                  draftOrder.delivery_notes,
                  draftOrder.deliveryinstructions,
                  draftOrder.notes
                ) ?? ''
              ) || undefined,
            mediaFiles: normalizeMediaFiles(
              firstValue(
                draftOrder.media,
                draftOrder.mediaFiles,
                draftOrder.media_files,
                rawEstimate.media,
                rawEstimate.mediaFiles,
                rawEstimate.media_files
              )
            ),
            perkmCost: draftOrder.perkm,
            distanceCost:
              draftOrder.payment_summary?.service_cost ??
              draftOrder.payment_summary?.distancecost ??
              draftOrder.payment_summary?.distance_cost,
            materialCost:
              draftOrder.payment_summary?.material_cost ??
              draftOrder.payment_summary?.materialcost,
            deliveryCost:
              draftOrder.payment_summary?.delivery_cost ??
              draftOrder.payment_summary?.deliverycost,
            serviceCost:
              toFiniteNumber(draftOrder.payment_summary?.service_cost) ?? null,
            estimatedCost: draftOrder.payment_summary?.total

              
          } : parsedOrder.orderType === 'vehicle_hire'
            ? {

              pickupContactPerson: rawEstimate.pickupContactPerson ?? '-',
              pickupPhoneNumber: rawEstimate.pickupPhoneNumber ?? '-',
              pickupPhone: rawEstimate.pickupPhone ?? rawEstimate.pickupPhoneNumber ?? '-',
              truckCategory: String(firstValue(rawEstimate.truckCategory, rawEstimate.truckcategory) ?? '') || undefined,
              goodsType: String(firstValue(rawEstimate.goodsType, rawEstimate.goods_type) ?? '') || undefined,
              pickupDate: String(firstValue(
                rawEstimate.pickupDate,
                rawEstimate.pickup_date,
                rawEstimate.scheduled_pickup_date
              ) ?? '') || undefined,
              deliveryContactPerson: String(firstValue(
                rawEstimate.deliveryContactPerson,
                rawEstimate.delivery_contact_person
              ) ?? '') || undefined,
              deliveryPhone: String(firstValue(
                rawEstimate.deliveryPhone,
                rawEstimate.delivery_contact_phone,
                rawEstimate.deliveryContactPhone
              ) ?? '') || undefined,
              mediaFiles: normalizeMediaFiles(
                firstValue(
                  rawEstimate.media,
                  rawEstimate.mediaFiles,
                  rawEstimate.media_files
                )
              ),
              serviceCost: toFiniteNumber(
                rawEstimate.service_cost ?? rawEstimate.total_price ?? rawEstimate.payment_summary?.service_cost
              ),
              estimatedCost: toFiniteNumber(rawEstimate.total_price) ?? 0,
              distanceCost: toFiniteNumber(rawEstimate.distance_cost),
              perkmCost: toFiniteNumber(rawEstimate.perkm),
              materialCost: null,
              deliveryCost: null,
              capacityTons: toFiniteNumber(rawEstimate.capacitytons) ?? 0,
              distanceKm:
                toFiniteNumber(parsedOrder.distanceKm ?? rawEstimate.distancekm) ?? 0,

            } : {
              estimatedCost:
                toFiniteNumber(
                  rawEstimate.totalamount ?? rawEstimate.estimate_total ?? rawEstimate.estimated_amount
                ) ?? 0,
              serviceCost: null,
              distanceCost: null,
              materialCost: toFiniteNumber(rawEstimate.material_cost ?? rawEstimate.materialcost),
              deliveryCost: toFiniteNumber(rawEstimate.delivery_cost ?? rawEstimate.deliverycost),
              capacityTons: null,
              distanceKm: toFiniteNumber(parsedOrder.distanceKm ?? rawEstimate.distancekm) ?? 0,
            };

        setEstimateSummary(mapped);
        
      } else {

        setError(estimateResult?.message || 'Failed to load estimate.');
      }

      setIsEstimateLoading(false);
    };

    loadEstimate();

    return () => {
      isMounted = false;
    };
  }, [accesstoken, data, source]);

  const getSummaryMediaFiles = (): OrderMediaFile[] => {
    if (source === 'draft') {
      return estimateSummary.mediaFiles ?? [];
    }

    const formMediaFiles = (parsedOrder as any)?.mediaFiles;
    return Array.isArray(formMediaFiles) ? (formMediaFiles as OrderMediaFile[]) : [];
  };

  const summaryMediaFiles = getSummaryMediaFiles();

  const createOrderOnly = async (): Promise<string | null> => {
    if (!parsedOrder || isSubmitting || isEstimateLoading) return null;

    setIsSubmitting(true);
    setError(null);

    let result: any = null;

    try {
      if (parsedOrder.orderType === 'materials') {
        const materialPayload = mapPayloadNaming(parsedOrder);
        const quarryId = (materialPayload as any)?.quarryid;
        const productId = (materialPayload as any)?.items?.[0]?.productid;

        if (!quarryId) {
          setError('Please select a delivery address linked to a valid quarry before submitting.');
          return null;
        }
        if (!productId) {
          setError('Selected product is invalid. Please reselect a product and try again.');
          return null;
        }

        result = await orderApi.createMaterialOrder(materialPayload as any, accesstoken);

      } else if (parsedOrder.orderType === 'vehicle_hire') {
        const truckPayload = mapPayloadNaming(parsedOrder);


        result = await orderApi.createTruckOrder(truckPayload as any, accesstoken);

      } else {
        setError('Invalid order type.');
        return null;
      }

      if (await handleSessionExpired(result, logout, (path) => router.replace(path as any))) return null;

      if (result?.success) {
        const createdOrderId = String((result as any)?.data?.order?.id ?? '').trim();
        setOrderId(createdOrderId);
        const mediaFiles: OrderMediaFile[] = Array.isArray((parsedOrder as any)?.mediaFiles)
          ? (parsedOrder as any).mediaFiles
          : [];

        if (createdOrderId && mediaFiles.length > 0) {
          for (const media of mediaFiles) {
            const uploadResult = await orderApi.uploadOrderMedia(
              createdOrderId,
              {
                uri: media.uri,
                name: media.name,
                type: media.mimeType,
              },
              accesstoken,
              media.mediaType === 'video' ? 'site_video' : 'site_photo'
            );

            if (!uploadResult?.success) {
              setError(uploadResult?.message || 'Order created, but some media failed to upload.');
              break;
            }
          }
        }
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        return createdOrderId;
      } else {
        setError(result?.message || 'Order creation failed. Please try again.');
        return null;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const payOrderWithPin = async (orderId: string, pin: string): Promise<boolean> => {

    const payResult = await orderApi.payOrder(
      orderId,
      {
        method: 'wallet',
        transaction_pin: pin,
        authorize_adjustments: true,
      },
      accesstoken
    );

    await handleSessionExpired(payResult, logout, (path) => router.replace(path as any));

    if (!payResult?.success) {
      setError(payResult?.message || 'Payment failed. Please try again.');

      return false;
    }

    await queryClient.invalidateQueries({ queryKey: ['orders'] });
    await queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    setOrderId(null);
    router.push('/order-success');
    return true;
  };

   

  const onConfirmPin = async (pin: string) => {
    if (isSubmitting || isEstimateLoading) return;
    setError(null);

    
    if (!orderId) {
      setShowPinModal(false);
      throw new Error("Order ID is missing.");
    }

    const paid = await payOrderWithPin(orderId, pin);
    if (!paid) {
      setShowPinModal(false);
    }
  };

  const estimatedCost = estimateSummary.estimatedCost ?? 0;
  


  const handleAlatPay = async (orderId: string | null) => {
   
    const payResult = await orderApi.payOrder(
      orderId,
      {
        method: 'alatpay',
        authorize_adjustments: true,
      },
      accesstoken
    );
  
    await handleSessionExpired(payResult, logout, (path) => router.replace(path as any));

    if (!payResult?.success) {
      setError(payResult?.message || 'Payment failed. Please try again.');
 
      throw new Error(payResult?.message || 'Payment failed.');
    }

    const result = payResult.data as AlatPayPaymentData;
 
  
    setPaymentData(result);
 
    router.push({
      pathname: "/alatpay-checkout" as any,
      params: {
        payment: JSON.stringify(result),
      },
    });
    // return payResult;
  };

  const handlePlaceOrder = async () => {
    if (source === "draft") {
      setPaymentOptions(true);
      return;
    }

    const createdOrderId = await createOrderOnly();
    if (createdOrderId) {
      setPaymentOptions(true);
    }
  };

  


  return (
    <SafeAreaView style={appStyles.containerWhite} edges={['top', 'bottom']}>
      <StatusBar barStyle='dark-content' backgroundColor='#fff' />
      <View style={appStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.backButton}>
          <Ionicons name='arrow-back' size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.headerTitleText}>New Order</Text>
      </View>

      <ScrollView contentContainerStyle={appStyles.summaryScrollContent}>
        <Text style={appStyles.summaryTitle}>Estimate Summary</Text>
        <Text style={appStyles.summarySubtitle}>
          A breakdown of your estimated {parsedOrder?.orderType === 'vehicle_hire' ? 'truck logistics' : 'material and delivery'} cost based on the information provided.
        </Text>

        <View style={appStyles.summaryCard}>
          <View style={appStyles.summaryLocationRow}>
            <View style={appStyles.summaryMapIconWrap}>
              <Ionicons name='map-outline' size={24} color={colors.primary} />
            </View>
            <View style={appStyles.summaryLocationTextWrap}>
              <Text style={appStyles.summaryLocationName}>{parsedOrder?.orderType === 'vehicle_hire'
                ? 'Truck Dispatch Request'
                : 'Material Request'}</Text>
              <View style={appStyles.summaryAddressRow}>
                <Ionicons name='location' size={14} color='#757575' />
                <Text style={appStyles.summaryAddressText}>
                  {source === 'draft'
                    ? (
                      parsedOrder?.orderType === 'vehicle_hire'
                        ? estimateSummary.pickupLocation
                        : estimateSummary.deliveryLocation
                    ) || '-'
                    : parsedOrder?.orderType === 'vehicle_hire'
                      ? parsedOrder?.pickupLocation || '-'
                      : parsedOrder?.deliveryAddress || '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={appStyles.summaryCard}>
              <SummaryRow label='Order Type' value={parsedOrder?.orderType === "vehicle_hire" ? "Truck" : 'Material'} />

          {parsedOrder?.orderType === "vehicle_hire" ? (
            <>
              <SummaryRow label='Truck Category' value={source === 'draft' ? formatTruckCategory(estimateSummary.truckCategory) : formatTruckCategory(parsedOrder?.truckCategory)} />
              <SummaryRow label='Type of Goods' value={source === 'draft' ? formatGoodsType(estimateSummary.goodsType) : formatGoodsType(parsedOrder?.goodsType)} />
              <SummaryRow label='Truck Size' value={source === 'draft' ? (estimateSummary.truckSize || '-') : (parsedOrder?.truckSize || '-')} />
              <SummaryRow
                label='Truck Capacity'
                value={estimateSummary.capacityTons == null ? '-' : `${estimateSummary.capacityTons.toLocaleString()} tons`}
              />
              <SummaryRow label='Number of Trucks' value={String(source === 'draft' ? (estimateSummary.numberOfTrucks ?? '-') : (parsedOrder?.numberOfTrucks || '-'))} />
              <SummaryRow label='Pickup Location' value={source === 'draft' ? (estimateSummary.pickupLocation || '-') : (parsedOrder?.pickupLocation || '-')} />
              <SummaryRow
                label='Pickup Contact Person'
                value={source === 'draft'
                  ? textValue(estimateSummary.pickupContactPerson)
                  : textValue(
                    parsedOrder?.pickupContactPerson,
                    (parsedOrder as any)?.pickup_contact_person
                  )}
              />
              <SummaryRow
                label='Pickup Phone Number'
                value={source === 'draft'
                  ? textValue(estimateSummary.pickupPhone ?? estimateSummary.pickupPhoneNumber)
                  : textValue(
                    (parsedOrder as any)?.pickupPhone,
                    parsedOrder?.pickupPhoneNumber,
                    (parsedOrder as any)?.pickup_phone
                  )}
              />
              <SummaryRow
                label='Pickup Date'
                value={source === 'draft'
                  ? textValue(estimateSummary.pickupDate)
                  : textValue(
                    parsedOrder?.pickupDate,
                    (parsedOrder as any)?.pickup_date,
                    (parsedOrder as any)?.scheduled_pickup_date
                  )}
              />
              <SummaryRow label='Delivery Location' value={source === 'draft' ? (estimateSummary.deliveryLocation || '-') : (parsedOrder?.deliveryLocation || '-')} />
              <SummaryRow
                label='Delivery Contact Person'
                value={source === 'draft'
                  ? textValue(estimateSummary.deliveryContactPerson)
                  : textValue(
                    parsedOrder?.deliveryContactPerson,
                    (parsedOrder as any)?.delivery_contact_person
                  )}
              />
              <SummaryRow
                label='Delivery Phone Number'
                value={source === 'draft'
                  ? textValue(estimateSummary.deliveryPhone ?? estimateSummary.deliveryContactPhone)
                  : textValue(
                    (parsedOrder as any)?.deliveryPhone,
                    (parsedOrder as any)?.deliveryContactPhone,
                    (parsedOrder as any)?.delivery_phone,
                    (parsedOrder as any)?.delivery_contact_phone
                  )}
              />

              <SummaryRow
                label='Route Distance'
                value={estimateSummary.distanceKm == null ? '-' : `${estimateSummary.distanceKm.toFixed(2)} km`}
              />
              <SummaryRow label='Preferred Dispatch Date' value={source === 'draft' ? (estimateSummary.dispatchDate || '-') : (parsedOrder?.dispatchDate || '-')} />
              <SummaryRow label='Goods Description' value={source === 'draft' ? (estimateSummary.cargoDescription || '-') : (parsedOrder?.cargoDescription || '-')} />
              <SummaryRow label='Delivery Notes' value={source === 'draft' ? (estimateSummary.deliveryNotes || '-') : (parsedOrder?.deliveryNotes || '-')} />
            </>
          ) : (
            <>
              <SummaryRow label='Material Type' value={source === 'draft' ? (estimateSummary.materialType || '-') : (parsedOrder?.materialType || '-')} />
              <SummaryRow
                label='Pricing Mode'
                value={
                  source === 'draft'
                    ? estimateSummary.pricingMode === 'per_truck'
                      ? 'Per Truck (Fixed)'
                      : 'Per Ton (Weight-Based)'
                    : (parsedOrder as any)?.pricingMode === 'per_truck'
                    ? 'Per Truck (Fixed)'
                    : 'Per Ton (Weight-Based)'
                }
              />
              <SummaryRow label='Quantity' value={String(source === 'draft' ? estimateSummary.quantityTons ?? '-' : parsedOrder?.quantityTons || '-')} />
              <SummaryRow label='Load Type' value={source === 'draft' ? (getMeasurementType(estimateSummary) || '-') : (getMeasurementType(parsedOrder) || '-')} />
              <SummaryRow
                label='Delivery Contact Person'
                value={source === 'draft'
                  ? textValue(estimateSummary.deliveryContactPerson)
                  : textValue(
                    parsedOrder?.deliveryContactPerson,
                    (parsedOrder as any)?.delivery_contact_person
                  )}
              />
              <SummaryRow
                label='Delivery Phone Number'
                value={source === 'draft'
                  ? textValue(estimateSummary.deliveryPhone ?? estimateSummary.deliveryContactPhone)
                  : textValue(
                    (parsedOrder as any)?.deliveryPhone,
                    (parsedOrder as any)?.deliveryContactPhone,
                    (parsedOrder as any)?.delivery_phone,
                    (parsedOrder as any)?.delivery_contact_phone
                  )}
              />
              <SummaryRow
                label='Delivery Distance'
                value={estimateSummary.distanceKm == null ? '-' : `${estimateSummary.distanceKm.toFixed(2)} km`}
              />
              <SummaryRow label='Delivery Date' value={source === 'draft' ? (estimateSummary.scheduledDate || '-') : (parsedOrder?.scheduledDate || '-')} />
              <SummaryRow label='Delivery Notes' value={source === 'draft' ? (estimateSummary.deliveryNotes || '-') : (parsedOrder?.deliveryNotes || '-')} />
            </>
          )}
        </View>

        <OrderMediaPreview
          files={summaryMediaFiles}
          title="Media"
          subtitle="Review the images and videos attached to this order."
        />

        <View style={appStyles.summaryCard}>
          <Text style={appStyles.summaryCardHeader}>Cost Breakdown</Text>
          <View style={appStyles.divider} />
          {parsedOrder?.orderType === 'vehicle_hire' ? (
            <>
              <View style={appStyles.summaryRow}>
                <Text style={[appStyles.summaryRowLabel, { fontWeight: '700' }]}>Truck Service Cost</Text>
                <Text style={[appStyles.summaryRowValue, { fontWeight: '700' }]}>
                  {isEstimateLoading
                    ? 'Calculating...'
                    : (estimateSummary.serviceCost ?? estimateSummary.estimatedCost) == null
                      ? '-'
                      : `NGN ${(estimateSummary.serviceCost ?? estimateSummary.estimatedCost)!.toLocaleString()}`
                  }
                </Text>
              </View>
            </>
          ) : (
            <>
              <SummaryRow
                label='Material Cost'
                value={
                  isEstimateLoading
                    ? 'Calculating...'
                    : estimateSummary.materialCost == null
                      ? '-'
                      : `NGN ${estimateSummary.materialCost.toLocaleString()}`
                }
              />
              <SummaryRow
                label='Delivery Cost'
                value={
                  isEstimateLoading
                    ? 'Calculating...'
                    : estimateSummary.deliveryCost == null
                      ? '-'
                      : `NGN ${estimateSummary.deliveryCost.toLocaleString()}`
                }
              />
            </>
          )}
          {parsedOrder?.orderType !== 'vehicle_hire' ? (
            <View style={appStyles.summaryTotalRow}>
              <Text style={appStyles.summaryTotalLabel}>Estimated Cost</Text>
              <Text style={appStyles.summaryTotalValue}>
                {isEstimateLoading ? 'Calculating Estimate...' : estimateSummary.estimatedCost == null ? '-' : `NGN ${estimateSummary.estimatedCost.toLocaleString()}`}
              </Text>
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={appStyles.errorContainer}>
            <Text style={appStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handlePlaceOrder}
          style={[appStyles.submitButtonRounded, (isSubmitting || isEstimateLoading) && appStyles.buttonDisabled]}
          activeOpacity={0.8}
          disabled={isSubmitting || isEstimateLoading}
        >
          {isSubmitting || isEstimateLoading ? (
            <ActivityIndicator size='small' color='#fff' style={{ marginRight: 8 }} />
          ) : (
            <Text style={appStyles.submitButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={paymentOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentOptions(false)}
      >

        <Pressable style={styles.overlay} onPress={() => setPaymentOptions(false)}>

          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={{ fontWeight: 600 }}>Payment Options</Text>
              <TouchableOpacity onPress={() => setPaymentOptions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              
            </View>
            <View style={appStyles.divider} />

            

            <TouchableOpacity style={styles.methodRow}
              onPress={() => {
                
                setShowPaymentModal(true);
                setPaymentOptions(false);
              }}
            >
              <View style={styles.walletIcon}>
                <Ionicons name="wallet-outline" size={20} color={BRAND_BLUE} />
              </View>
              <View style={styles.walletDetails}>
                <Text style={styles.walletBalance}>Pay with Wallet</Text>
                <Text style={appStyles.headerSubtitle}>Pay immediately from your wallet balance</Text>

              </View>

            </TouchableOpacity>

            <TouchableOpacity style={styles.methodRow}

              disabled={!orderId}
              onPress={() => {
                handleAlatPay(orderId);
                setPaymentOptions(false);
                
              }}      
              
            >
              <View style={styles.walletIcon}>
                <Ionicons name="business-outline" size={20} color={BRAND_BLUE} />
              </View>
              <View style={styles.walletDetails}>
                <Text style={styles.walletBalance}>Pay Directly with ALATPay</Text>
                <Text style={appStyles.headerSubtitle}>Choose card, bank transfer, or ALAT/Wema securely on ALATPay </Text>
              </View>

            </TouchableOpacity>

          </View>


        </Pressable>
      </Modal>
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onRequestPin={() => {
          setShowPaymentModal(false);
          setShowPinModal(true);
        }}
        estimatedCost={estimatedCost ?? 0}
      />
      <PinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={onConfirmPin}
      />

      
      

      
    </SafeAreaView>


  );
}


const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 15 },
    modalContent: { 
      backgroundColor: '#fff', 
      borderRadius: 16, 
      padding: 20, 
      paddingBottom: 40, 
      
     
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 16, fontWeight: '600' },
    amountCard: { backgroundColor: '#eef2f6', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20 },
    amountLabel: { color: BRAND_BLUE, fontSize: 14, marginBottom: 5 },
    amountValue: { fontSize: 28, fontWeight: 'bold', color: BRAND_BLUE },
    sectionLabel: { fontWeight: '600', marginBottom: 10 },
    methodRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginVertical: 5 },
    walletIcon: { backgroundColor: '#f0f4f8', padding: 8, borderRadius: 8, marginRight: 10 },
    walletDetails: { flex: 1 },
    walletBalance: { fontWeight: '600', fontSize: 14 },
    insufficient: { color: 'red', fontSize: 12 },
    addMoneyBtn: { backgroundColor: BRAND_BLUE, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    addMoneyText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    authRow: { flexDirection: 'row', marginTop: 20, marginBottom: 25 },
    authText: { flex: 1, fontSize: 12, color: '#666', marginLeft: 10, lineHeight: 18 },
    payButton: { backgroundColor: BRAND_BLUE, padding: 18, borderRadius: 30, alignItems: 'center' },
    payText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});





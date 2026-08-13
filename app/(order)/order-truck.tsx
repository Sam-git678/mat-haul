import FormField from '@/components/FormField';
import MediaUploadGrid from '@/components/MediaUploadGrid';
import { appStyles, colors } from "@/constants";
import { locationApi, orderApi } from '@/src/config/api';
import { useAddressAutocomplete } from '@/src/hooks/useAddressAutocomplete';
import { useOrderMediaPicker } from '@/src/hooks/useOrderMediaPicker';
import { OrderTruckFormData, orderTruckSchema } from '@/src/schemas/order.schema';
import { googlePlacesApi } from '@/src/services/googlePlaces';
import { getPublicBaseUrl, handleSessionExpired } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';


import { vehicleApi } from '@/src/config/api';
import {
  LoadingPoint,
  PickupOption,
  SelectedPickupAddress
} from '@/types/location';
import { VehicleTypeItem, VehicleTypesData } from '@/types/vehicle';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';

const orderTypePills = [
  { key: 'materials', eyebrow: 'Supplies', label: 'Material', route: '/order-material' },
  { key: 'truck', eyebrow: 'Logistics', label: 'Truck', route: '/order-truck' },
] as const;

const TRUCK_CATEGORY_OPTIONS = [
  { value: 'tipper', label: 'Tipper', helper: 'Best for loose and bulk materials.' },
  { value: 'lorry', label: 'Lorry', helper: 'Good for general freight and mixed loads.' },
  { value: 'flatbed', label: 'Flatbed', helper: 'Ideal for equipment and oversized items.' },
  { value: 'containercarrier', label: 'Container Carrier', helper: 'Made for containers and boxed cargo.' },
  { value: 'other', label: 'Other', helper: 'Use this if none of the standard types fit.' },
] as const;

const GOODS_TYPE_OPTIONS = [
  {
    value: 'building_materials',
    label: 'Building Materials',
    description: 'Sand, granite, blocks, cement, and site supplies.',
  },
  {
    value: 'equipment',
    label: 'Equipment',
    description: 'Construction tools, plant items, and work equipment.',
  },
  {
    value: 'household_goods',
    label: 'Household Goods',
    description: 'Furniture, fittings, and personal moving items.',
  },
  {
    value: 'commercial_goods',
    label: 'Commercial Goods',
    description: 'Shop stock, packaged goods, and business cargo.',
  },
  {
    value: 'agricultural_goods',
    label: 'Agricultural Goods',
    description: 'Farm produce, inputs, and agricultural materials.',
  },
  {
    value: 'other',
    label: 'Other Goods',
    description: 'Use this when the goods need a custom description.',
  },
] as const;

type DeliveryAddressSuggestion = {
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  quarryId?: string;
  distancekm?: number;
};

type TruckSuggestion = {
  id: string;
  name: string;
  capacityLabel: string;
  description: string;
  image?: { uri: string };
  recommendationLabel?: string;
  recommendationTag?: string;
};

type BackendVehicleTypeItem = VehicleTypeItem & {
  category?: string;
  supported_goods_types?: unknown;
  displayorder?: number | string;
  imageurl?: string;
  image_url?: string;
  image?: string;
  picture?: string;
};

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const formatCapacityLabel = (capacitytons?: number | string) => {
  const parsed = Number(capacitytons);
  if (!Number.isFinite(parsed) || parsed <= 0) return 'Capacity on request';
  return `${parsed % 1 === 0 ? parsed : parsed.toFixed(1)} Ton`;
};

const truckCategoryLabel = (value?: string) =>
  TRUCK_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? 'Choose a truck category';

const goodsTypeLabel = (value?: string) =>
  GOODS_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? 'Choose a goods type';

const goodsTypeDescription = (value?: string) =>
  GOODS_TYPE_OPTIONS.find((option) => option.value === value)?.description ?? '';

const resolveTruckImage = (item: BackendVehicleTypeItem): { uri: string } | undefined => {
  const raw = String(
    item.imageurl ??
    item.image_url ??
    item.image ??
    item.picture ??
    ''
  ).trim();

  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return { uri: raw };

  const baseUrl = getPublicBaseUrl();
  if (!baseUrl) return undefined;

  return {
    uri: raw.startsWith('/') ? `${baseUrl}${raw}` : `${baseUrl}/${raw}`,
  };
};

const buildRecommendationLabel = (goodsType?: string) => {
  switch (goodsType) {
    case 'building_materials':
      return 'Recommended for bulk building materials';
    case 'equipment':
      return 'Recommended for equipment and plant items';
    case 'household_goods':
      return 'Recommended for careful moving jobs';
    case 'commercial_goods':
      return 'Recommended for business cargo';
    case 'agricultural_goods':
      return 'Recommended for farm and produce logistics';
    default:
      return 'Recommended for your cargo';
  }
};

const parseDisplayOrder = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
};

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return asStringArray(parsed);
    } catch {
      return raw.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
};

const matchesSelectedTruckCategory = (item: BackendVehicleTypeItem, selectedTruckCategory?: string) => {
  if (!selectedTruckCategory || selectedTruckCategory === 'other') return true;
  return String(item.category ?? '').toLowerCase() === selectedTruckCategory.toLowerCase();
};

const matchesSelectedGoodsType = (item: BackendVehicleTypeItem, selectedGoodsType?: string) => {
  if (!selectedGoodsType || selectedGoodsType === 'other') return true;

  const supportedGoodsTypes = asStringArray(item.supported_goods_types);
  if (!supportedGoodsTypes.length) return true;

  const normalizedSelection = selectedGoodsType.toLowerCase();
  return supportedGoodsTypes.some((goodsType) => goodsType.toLowerCase() === normalizedSelection);
};



const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const parseIsoDate = (value?: string) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};
export default function OrderTruckForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accesstoken, logout, isLoading: isAuthLoading } = useAuth();
  const params = useLocalSearchParams<{ materialType?: string; orderType?: string; truckSize?: string; vehicleTypeId?: string; draftId?: string }>();
  const selectedTruckSize = typeof params.truckSize === 'string' ? params.truckSize : '';
  const [showTruckCategoryDropdown, setShowTruckCategoryDropdown] = useState(false);
  const [showGoodsTypeModal, setShowGoodsTypeModal] = useState(false);
  const [showPickupDatePicker, setShowPickupDatePicker] = React.useState(false);
  const [showDispatchDatePicker, setShowDispatchDatePicker] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEstimateLoading, setIsEstimateLoading] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedPickupAddress, setSelectedPickupAddress] =
    React.useState<SelectedPickupAddress>({
      title: '',
      formattedAddress: '',
      latitude: undefined,
      longitude: undefined,
      pickupLocationId: undefined,
      distancekm: undefined,
    });

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = React.useState<{
    formattedAddress: string;
    latitude?: number;
    longitude?: number;
    quarryId?: string;
    distancekm?: number;
  }>({ formattedAddress: '' });
  const [resolvedVehicleTypeId, setResolvedVehicleTypeId] = React.useState(typeof params.vehicleTypeId === 'string' ? params.vehicleTypeId : '');
  const isHydratingRef = React.useRef(false);
  const lastSavedRef = React.useRef('');
  const mediaPicker = useOrderMediaPicker();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    setError: setFormError,
    clearErrors,
  } = useForm<OrderTruckFormData>({
    resolver: zodResolver(orderTruckSchema),
    defaultValues: {
      orderType: 'vehicle_hire',
      truckCategory: '' as any,
      goodsType: '' as any,
      truckSize: '',
      numberOfTrucks: '',
      pickupLocation: '',
      pickupContactPerson: '',
      pickupPhone: '',
      pickupDate: '',
      deliveryLocation: '',
      deliveryContactPerson: '',
      deliveryPhone: '',
      dispatchDate: '',
      cargoDescription: '',
      deliveryNotes: '',
    },
  });

  const pickup = useAddressAutocomplete({
    token: accesstoken ?? undefined,
    enabled: !isAuthLoading,
  });
  const delivery = useAddressAutocomplete({
    token: accesstoken ?? undefined,
    enabled: !isAuthLoading,
  });

  const {
    data: vehicleTypesData,
    isLoading: vehicleTypesLoading,
    isError: vehicleTypesError,
  } = useQuery<VehicleTypesData>({
    queryKey: ['vehicle-types', accesstoken],
    queryFn: async () => {
      const result = await vehicleApi.getVehicleTypes(accesstoken);
      await handleSessionExpired(result, logout, (path) => router.replace(path as any));

      if (!result?.success) {
        throw new Error(result?.message || 'Failed to load truck suggestions.');
      }

      return result.data ?? { vehicletypes: [] };
    },
    enabled: !!accesstoken,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (selectedTruckSize.trim()) {
      setValue('truckSize', selectedTruckSize.trim(), { shouldValidate: true });
    }
  }, [selectedTruckSize, setValue]);

  const selectedTruckCategory = watch('truckCategory');
  const selectedGoodsType = watch('goodsType');
  const truckSizeValue = watch('truckSize');
  const selectedTruckCategoryLabel = truckCategoryLabel(selectedTruckCategory);
  const selectedGoodsTypeLabel = goodsTypeLabel(selectedGoodsType);

  const suggestedTrucks = useMemo<TruckSuggestion[]>(() => {
    const vehicleTypes = (vehicleTypesData?.vehicletypes ?? []) as BackendVehicleTypeItem[];
    if (!selectedTruckCategory || !selectedGoodsType) {
      return [];
    }

    const filtered = vehicleTypes
      .slice()
      .filter((item) => matchesSelectedTruckCategory(item, selectedTruckCategory))
      .filter((item) => matchesSelectedGoodsType(item, selectedGoodsType))
      .sort((a, b) => {
        const aOrder = parseDisplayOrder(a.displayorder);
        const bOrder = parseDisplayOrder(b.displayorder);
        if (aOrder !== bOrder) return aOrder - bOrder;

        const aCapacity = Number(a.capacitytons ?? 0);
        const bCapacity = Number(b.capacitytons ?? 0);
        if (Number.isFinite(aCapacity) && Number.isFinite(bCapacity) && aCapacity !== bCapacity) {
          return bCapacity - aCapacity;
        }

        return String(a.name ?? '').localeCompare(String(b.name ?? ''));
      })
      .slice(0, 2);

    const mapped = filtered.map((item, index) => {
      const capacityLabel = formatCapacityLabel(item.capacitytons);
      const recommendationLabel = buildRecommendationLabel(selectedGoodsType);
      const image = resolveTruckImage(item);

      return {
        id: String(item.id ?? '').trim(),
        name: String(item.name ?? `Suggested truck ${index + 1}`),
        capacityLabel,
        description:
          capacityLabel === 'Capacity on request'
            ? 'Tap to prefill this truck for the current request.'
            : `Reccommended for loads with ${capacityLabel.toLowerCase()} capacity.`,
        image,
        recommendationLabel,
        recommendationTag:
          selectedTruckCategory && selectedTruckCategory !== 'other'
            ? truckCategoryLabel(selectedTruckCategory)
            : capacityLabel,
      };
    });

    return mapped;
  }, [selectedGoodsType, selectedTruckCategory, vehicleTypesData?.vehicletypes]);

  const selectedSuggestedTruck = useMemo(() => {
    const normalizedTruckSize = normalizeText(truckSizeValue || selectedTruckSize);
    return suggestedTrucks.find((item) => {
      const normalizedName = normalizeText(item.name);
      return (
        (resolvedVehicleTypeId && item.id === resolvedVehicleTypeId) ||
        (!!normalizedTruckSize && normalizedName === normalizedTruckSize)
      );
    });
  }, [resolvedVehicleTypeId, selectedTruckSize, suggestedTrucks, truckSizeValue]);





  const pickupLocationsQueryKey = (

    accesstoken: string | null
  ) =>
    ['pickup-locations', accesstoken] as const;



  const fetchPickupLocations = async (

    accesstoken: string | null
  ) => {
    const result = await locationApi.loadingPoints(accesstoken);
    await handleSessionExpired(result, logout, (path) => router.replace(path as any));


    if (!result?.success) {
      throw new Error(
        result?.message || 'Failed to load pickup locations'
      );
    }





    const mapped: PickupOption[] = result.data.loadingpoints.map(
      (item: LoadingPoint) => ({
        id: item.id,

        type: "loading_point",

        title: item.name,

        address: item.address,

        latitude: Number(item.latitude),

        longitude: Number(item.longitude),

        pickupLocationId: item.id,
      })
    );






    return mapped;




  };

  const {
    data: loadingPointOptions,
    isLoading: loadingPointsLoading,
    isError: loadingPointsError,
    refetch: refetchLoadingPoints,
    isFetching: isFetchingLoadingPoints,
  } = useQuery<PickupOption[]>({
    queryKey: pickupLocationsQueryKey(accesstoken),
    queryFn: () => fetchPickupLocations(accesstoken),

    enabled: !!accesstoken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });





  const handleDeliveryAddressSelect = async (item: DeliveryAddressSuggestion) => {
    delivery.select(item);
    setValue('deliveryLocation', item.formattedAddress, { shouldValidate: true });
    clearErrors('deliveryLocation');

    try {
      const geocode = await googlePlacesApi.geocodeAddress(item.formattedAddress);
      if (!geocode) {
        setSelectedDeliveryAddress({
          formattedAddress: item.formattedAddress,
          quarryId: item.quarryId,
          distancekm: item.distancekm,
        });
        return;
      }

      delivery.setSelected({
        ...item,
        formattedAddress: geocode.formattedAddress,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
      });

      setSelectedDeliveryAddress({
        formattedAddress: geocode.formattedAddress,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        quarryId: item.quarryId,
        distancekm: item.distancekm,
      });
    } catch {
      setSelectedDeliveryAddress({
        formattedAddress: item.formattedAddress,
        quarryId: item.quarryId,
        distancekm: item.distancekm,
      });
    }
  };


  const createOrderOnly = async (data: OrderTruckFormData): Promise<string | null> => {

    if (isSubmitting || isEstimateLoading) return null;

    setIsSubmitting(true);
    setError(null);

    let result: any = null;



    try {

      const buildTruckPayload = (data: OrderTruckFormData) => ({
        // Keep distance aliases to match varying backend field names.
        vehicletypeid: resolvedVehicleTypeId,
        truckcategory: data.truckCategory,
        goods_type: data.goodsType,
        truckcount: Number(data.numberOfTrucks),
        unitcount: Number(data.numberOfTrucks),

        pickup_location: data.pickupLocation,
        pickup_address: data.pickupLocation,
        pickup_latitude: selectedPickupAddress.latitude,
        pickup_longitude: selectedPickupAddress.longitude,
        pickup_location_id: selectedPickupAddress.pickupLocationId,
        pickup_contact_person: data.pickupContactPerson,
        pickup_phone: data.pickupPhone,
        pickup_date: data.pickupDate,
        delivery_location: data.deliveryLocation,
        deliveryaddress: data.deliveryLocation,
        deliverylatitude: selectedDeliveryAddress.latitude,
        deliverylongitude: selectedDeliveryAddress.longitude,
        delivery_contact_person: data.deliveryContactPerson,
        delivery_phone: data.deliveryPhone,
        dropoff_address: data.deliveryLocation,
        dropoff_latitude: selectedDeliveryAddress.latitude,
        dropoff_longitude: selectedDeliveryAddress.longitude,
        scheduled_date: data.dispatchDate ?? '',
        scheduled_time: undefined,
        notes: data.cargoDescription ?? '',
        cargo_description: data.cargoDescription ?? '',
        delivery_notes: data.deliveryNotes ?? '',
      });





      const payload = buildTruckPayload(data);



      // const quarryId = payload.quarryid;
      result = await orderApi.createTruckOrder(payload as any, accesstoken);



      await handleSessionExpired(result, logout, (path) => router.replace(path as any));

      if (result?.success) {
        const createdOrderId = String((result as any)?.data?.order?.id ?? '').trim();
        setPendingOrderId(createdOrderId || null);
        const mediaFiles = mediaPicker.files;

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
        return createdOrderId || null;
      } else {
        setError(result?.message || 'Order creation failed. Please try again.');
        return null;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onContinue = (data: OrderTruckFormData) => {
    const hasPickupLocationId = Boolean(selectedPickupAddress.pickupLocationId);
    const hasPickupCoordinates =
      typeof selectedPickupAddress.latitude === 'number' && typeof selectedPickupAddress.longitude === 'number';
    const hasDeliveryCoordinates =
      typeof selectedDeliveryAddress.latitude === 'number' && typeof selectedDeliveryAddress.longitude === 'number';

    if (!hasPickupLocationId && !hasPickupCoordinates) {
      setFormError('pickupLocation', {
        type: 'manual',
        message: 'Select a pickup address from suggestions so coordinates can be captured.',
      });
      return;
    }

    if (!hasDeliveryCoordinates) {
      setFormError('deliveryLocation', {
        type: 'manual',
        message: 'Select a delivery address from suggestions so coordinates can be captured.',
      });
      return;
    }

    const vehicleTypeId = resolvedVehicleTypeId || (typeof params.vehicleTypeId === 'string' ? params.vehicleTypeId : '');
    router.push({
      pathname: '/estimate-summary',
      params: {
        source: "new-order",
        data: JSON.stringify({
          orderType: data.orderType,
          vehicleTypeId,
          truckCategory: data.truckCategory,
          goodsType: data.goodsType,
          truckSize: data.truckSize,
          numberOfTrucks: Number(data.numberOfTrucks ?? ''),
          pickupLocation: data.pickupLocation,
          pickupContactPerson: data.pickupContactPerson,
          pickupPhone: data.pickupPhone,
          pickupDate: data.pickupDate,
          deliveryLocation: data.deliveryLocation,
          deliveryContactPerson: data.deliveryContactPerson,
          deliveryPhone: data.deliveryPhone,
          pickupLatitude: selectedPickupAddress.latitude,
          pickupLongitude: selectedPickupAddress.longitude,
          pickupLocationId: selectedPickupAddress.pickupLocationId,
          pickupDistancekm: selectedPickupAddress.distancekm,
          deliveryLatitude: selectedDeliveryAddress.latitude,
          deliveryLongitude: selectedDeliveryAddress.longitude,
          deliveryQuarryId: selectedDeliveryAddress.quarryId,
          deliveryDistancekm: selectedDeliveryAddress.distancekm,
          dispatchDate: data.dispatchDate ?? '',
          cargoDescription: data.cargoDescription ?? '',
          deliveryNotes: data.deliveryNotes ?? '',
          mediaFiles: mediaPicker.files,
        }),
      },
    });
  };

  const pickupDateValue = watch('pickupDate');
  const dispatchDateValue = watch('dispatchDate');

  const onPickupDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPickupDatePicker(false);
    }
    if (event.type !== 'set' || !date) return;
    setValue('pickupDate', formatDate(date), { shouldValidate: true });
  };

  const onDispatchDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDispatchDatePicker(false);
    }
    if (event.type !== 'set' || !date) return;
    setValue('dispatchDate', formatDate(date), { shouldValidate: true });
  };

  return (
    <SafeAreaView style={appStyles.containerWhite} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? -300 : 0}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={appStyles.header}>
          <TouchableOpacity onPress={() => router.dismissTo('/(tabs)/order')} style={appStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={appStyles.headerTitleText}>Order Truck</Text>
        </View>

        <ScrollView contentContainerStyle={[appStyles.summaryScrollContent, { flexGrow: 1 }]} showsVerticalScrollIndicator={false}>
          <View style={appStyles.tabSectionTight}>
            <Text style={appStyles.switcherLabel}>Order Type</Text>
            <View style={[appStyles.segmentedControl, appStyles.segmentedControlWithSpacing]}>
              {orderTypePills.map((pill) => {
                const isActive = pill.key === 'truck';

                return (
                  <TouchableOpacity
                    key={pill.key}
                    activeOpacity={0.9}
                    onPress={() => {
                      if (isActive) return;

                      router.navigate(pill.route);
                    }}
                    style={[appStyles.segmentedTab, isActive && appStyles.segmentedTabActive]}
                  >
                    <Text style={[appStyles.segmentedEyebrow, isActive && appStyles.segmentedEyebrowActive]}>{pill.eyebrow}</Text>
                    <Text style={[appStyles.segmentedText, isActive && appStyles.segmentedTextActive]}>{pill.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={appStyles.summaryTitle}>Truck Request Details</Text>
          <Text style={appStyles.summarySubtitle}>
            Pick the truck category and cargo type first, then we’ll help you narrow down the right vehicle.
          </Text>

          <View style={appStyles.inputWrapper}>
            <Text style={appStyles.formLabel}>
              Truck Category <Text style={appStyles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowGoodsTypeModal(false);
                setShowTruckCategoryDropdown((previous) => !previous);
              }}
              style={[
                appStyles.inputContainer,
                {
                  minHeight: 54,
                  paddingHorizontal: 14,
                  justifyContent: 'space-between',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name="car-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, color: selectedTruckCategory ? colors.text : colors.textMuted }}>
                  {selectedTruckCategoryLabel}
                </Text>
              </View>
              <Ionicons name="chevron-down-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {showTruckCategoryDropdown ? (
              <View style={styles.dropdownMenu}>
                {TRUCK_CATEGORY_OPTIONS.map((option, index) => {
                  const isActive = selectedTruckCategory === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.88}
                      onPress={() => {
                        setValue('truckCategory', option.value, { shouldValidate: true });
                        setShowTruckCategoryDropdown(false);
                      }}
                      style={[
                        styles.dropdownOption,
                        index === TRUCK_CATEGORY_OPTIONS.length - 1 && styles.dropdownOptionLast,
                        isActive && styles.dropdownOptionActive,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdownOptionTitle, isActive && styles.dropdownOptionTitleActive]}>
                          {option.label}
                        </Text>
                        <Text style={[styles.dropdownOptionSubtitle, isActive && styles.dropdownOptionSubtitleActive]}>
                          {option.helper}
                        </Text>
                      </View>
                      {isActive ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
            {errors.truckCategory?.message ? (
              <Text style={appStyles.errorText}>{String(errors.truckCategory.message)}</Text>
            ) : null}
            <Text style={[appStyles.helperText, { marginTop: 6 }]}>
              Choose the general body style that best matches the cargo.
            </Text>
          </View>

          <View style={appStyles.inputWrapper}>
            <Text style={appStyles.formLabel}>
              Type of Goods <Text style={appStyles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowTruckCategoryDropdown(false);
                setShowGoodsTypeModal(true);
              }}
              style={[
                appStyles.inputContainer,
                {
                  minHeight: 54,
                  paddingHorizontal: 14,
                  justifyContent: 'space-between',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name="cube-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, color: selectedGoodsType ? colors.text : colors.textMuted }}>
                  {selectedGoodsTypeLabel}
                </Text>
              </View>
              <Ionicons name="chevron-down-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {errors.goodsType?.message ? (
              <Text style={appStyles.errorText}>{String(errors.goodsType.message)}</Text>
            ) : null}
            <Text style={[appStyles.helperText, { marginTop: 6 }]}>
              Choose the cargo type so we can match the right truck capacity and body style.
            </Text>
          </View>

          <FormField
            required={selectedGoodsType === 'other' ? '*' : ''}
            label="Goods Description"
            placeholder={selectedGoodsType === 'other'
              ? 'Describe the cargo in detail'
              : goodsTypeDescription(selectedGoodsType) || 'Add useful cargo details'}
            icon="cube-outline"
            control={control}
            name="cargoDescription"
            errorText={errors.cargoDescription?.message ? String(errors.cargoDescription.message) : undefined}
          />

          <View style={appStyles.inputWrapper}>
            <Text style={appStyles.formLabel}>Suggested Trucks</Text>
            <Text style={[appStyles.helperText, { marginBottom: 12 }]}>
              Tap a card to prefill the truck size and vehicle selection.
            </Text>

            {vehicleTypesLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={appStyles.helperText}>Loading recommended trucks...</Text>
              </View>
            ) : null}

            {vehicleTypesError ? (
              <Text style={appStyles.errorText}>
                We could not load live truck suggestions right now. You can still continue with a manual truck size.
              </Text>
            ) : null}

            {selectedTruckCategory && selectedGoodsType ? (
              suggestedTrucks.length > 0 ? (
                <View style={styles.truckSuggestionStack}>
                  {suggestedTrucks.map((item) => {
                    const isActive =
                      selectedSuggestedTruck?.id === item.id ||
                      normalizeText(String(truckSizeValue || selectedTruckSize || '')) === normalizeText(item.name);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.92}
                        onPress={() => {
                          setValue('truckSize', item.name, { shouldValidate: true });
                          clearErrors('truckSize');
                          setResolvedVehicleTypeId(item.id);
                        }}
                        style={[styles.truckSuggestionCard, isActive && styles.truckSuggestionCardActive]}
                      >
                        {item.image ? (
                          <Image source={item.image} style={styles.truckSuggestionImage} contentFit="cover" />
                        ) : null}
                        <View style={styles.truckSuggestionBody}>
                          <View style={styles.truckSuggestionHeader}>
                            <Text style={styles.truckSuggestionTitle} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <View style={[styles.recommendationBadge, isActive && styles.recommendationBadgeActive]}>
                              <Text style={[styles.recommendationBadgeText, isActive && styles.recommendationBadgeTextActive]}>
                                {item.recommendationTag ?? 'Recommended'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.truckSuggestionDescription} numberOfLines={2}>
                            {item.description ?? 'Recommended for your request'}
                          </Text>
                          <View style={styles.truckSuggestionMetaRow}>
                            <View style={styles.capacityPill}>
                              <Text style={styles.capacityPillText}>{item.capacityLabel}</Text>
                            </View>
                          </View>
                          
                        </View>
                        <View style={[styles.radioCircle, isActive && styles.radioCircleActive]}>
                          {isActive ? <View style={styles.radioInner} /> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyTruckState}>
                  <Text style={styles.emptyTruckTitle}>No compatible truck is available</Text>
                  <Text style={styles.emptyTruckText}>
                    No active truck for the selected vehicle category, {selectedTruckCategoryLabel}, that supports the selected goods type, {selectedGoodsTypeLabel}. Please change the goods type or truck category.
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.emptyTruckState}>
                <Text style={styles.emptyTruckTitle}>Truck suggestions will appear here</Text>
                <Text style={styles.emptyTruckText}>
                  Select a truck category and goods type so the system can show suitable trucks with pictures.
                </Text>
              </View>
            )}
          </View>

          <FormField
            required='*'
            label="Truck Size"
            placeholder="e.g. HOWO 12 Tyre, 30 Ton Truck"
            icon="car-outline"
            control={control}
            name="truckSize"
            inputOnChangeText={(text) => {
              setResolvedVehicleTypeId('');
              setValue('truckSize', text, { shouldValidate: true });
            }}
            errorText={errors.truckSize?.message ? String(errors.truckSize.message) : undefined}
          />
          <Text style={[appStyles.helperText, { marginTop: -10, marginBottom: 16 }]}>
            The selected truck fills this field automatically, but you can also type a custom size.
          </Text>

          <FormField
            required='*'
            label="Number of Trucks"
            placeholder="Enter number of trucks needed"
            icon="apps-outline"
            keyboardType="number-pad"
            control={control}
            name="numberOfTrucks"
            errorText={errors.numberOfTrucks?.message ? String(errors.numberOfTrucks.message) : undefined}
          />

          <View>
            <Text 
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 10
              }}
              >
                Pickup Information
            </Text>
          </View>

          <View style={appStyles.divider}></View>

          <View style={appStyles.inputWrapper}>
            <Text style={appStyles.formLabel}>
              Pickup Location <Text style={appStyles.requiredStar}>*</Text>
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPickupSuggestions(previous => !previous)}
              style={[
                appStyles.inputContainer,
                {
                  minHeight: 54,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                },
              ]}
            >


              <Text
                style={{
                  color: selectedPickupAddress.title
                    ? colors.text
                    : colors.textSubtle
                }}



              >
                {selectedPickupAddress.title || "Select a pickup address"}
              </Text>
              <Ionicons
                name={
                  showPickupSuggestions
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>


            {pickup.loading ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 6,
                }}
              >



              </View>
            ) : null}

            {errors.pickupLocation?.message ? (
              <Text style={appStyles.errorText}>
                {String(errors.pickupLocation.message)}
              </Text>
            ) : null}


            {showPickupSuggestions &&
              loadingPointOptions &&
              loadingPointOptions.length > 0 ? (
              <View
                style={{
                  marginTop: 8,
                  maxHeight: 250,

                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                  backgroundColor: colors.white,
                }}
              >

                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >

                  <View style={{backgroundColor: colors.bgGray, padding: 12}}>
                    <Text style={{fontWeight: 'bold', color: colors.textMuted}}>SYSTEM PICKUP LOCATIONS</Text>
                  </View>

                  {loadingPointOptions.map(
                    (item: PickupOption, index: number) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          setShowPickupSuggestions(false);

                          pickup.setInput(item.title);

                          setValue("pickupLocation", item.title, {
                            shouldValidate: true,
                          });

                          clearErrors("pickupLocation");

                          setSelectedPickupAddress({
                            title: item.title,
                            formattedAddress: item.address,
                            latitude: item.latitude,
                            longitude: item.longitude,
                            pickupLocationId: item.pickupLocationId,
                          });
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          borderBottomWidth: index === loadingPointOptions.length - 1 ? 0 : 1,
                          borderBottomColor: '#F1F5F9',
                        }}
                      >
                        <Text
                          style={{
                            color: colors.textBody,
                            fontWeight: '500',
                          }}
                        >
                          {item.title}
                        </Text>

                        <Text
                          style={{
                            color: colors.textMuted,
                            marginTop: 2,
                          }}
                        >
                          {item.address}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>
            ) : null}
          </View>




          <View>
            <Text style={appStyles.formLabel}>Pickup Address Details <Text style={appStyles.requiredStar}>*</Text></Text>
            {selectedPickupAddress.pickupLocationId ? (
              <View
                style={{
                  marginBottom: 16,
                  padding: 14,
                  borderRadius: 12,
                  borderStyle: 'solid',
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Ionicons name="location-outline" size={20} color="#757575" style={{ marginRight: 10 }} />
                  <Text
                    style={{
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    {selectedPickupAddress.title}
                  </Text>


                </View>

                <Text
                  style={{
                    marginTop: 4,
                    color: colors.textMuted,
                    marginLeft: 30
                  }}
                >
                  {selectedPickupAddress.formattedAddress}
                </Text>

              </View>
            ) : (
              <View style={appStyles.pickupLocationTile}>

                <Ionicons name="location-outline" size={20} color="#757575" style={{ marginRight: 10 }} />
                <Text style={appStyles.headerSubtitle}>
                  Select a pickup location above to load its address.
                </Text>

              </View>
            )}
          </View>



          <FormField
            required=' *'
            label="Pickup Contact Person"
            placeholder="Enter contact name"
            icon="person-outline"
           
            control={control}
            name="pickupContactPerson"
            errorText={errors.pickupContactPerson?.message ? String(errors.pickupContactPerson.message) : undefined}
          />

          <FormField
            required=' *'
            label="Pickup Phone"
            placeholder="Enter contact phone"
            icon="call-outline"
            keyboardType="number-pad"
            control={control}
            name="pickupPhone"
            errorText={errors.pickupPhone?.message ? String(errors.pickupPhone.message) : undefined}
          />

          <View style={appStyles.inputWrapper}>
            <Text style={appStyles.formLabel}>Preferred Pickup Date (Optional)</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPickupDatePicker(true)}
              style={[appStyles.inputContainer, { minHeight: 54, paddingHorizontal: 14 }]}
            >
              <Ionicons name="calendar-outline" size={20} color="#757575" style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, color: pickupDateValue ? colors.text : colors.textMuted }}>
                {pickupDateValue || 'YYYY-MM-DD'}
              </Text>
            </TouchableOpacity>
            {errors.pickupDate?.message ? (
              <Text style={appStyles.errorText}>{String(errors.pickupDate.message)}</Text>
            ) : null}
          </View>
          {showPickupDatePicker ? (
            <DateTimePicker
              value={parseIsoDate(pickupDateValue)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickupDateChange}
            />
          ) : null}


          <View>
            <Text 
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 10
              }}
              >
                Delivery Information
            </Text>
          </View>

          <View style={appStyles.divider}></View>


          <FormField
            required=' *'
            label="Delivery Location"
            placeholder="Enter full delivery address"
            value={delivery.input}
            icon="location-outline"
            keyboardType="default"
            control={control}
            name="deliveryLocation"
            onChangeText={(text) => {
              delivery.setInput(text);
              setValue('deliveryLocation', text, { shouldValidate: true });
              clearErrors('deliveryLocation');
              setSelectedDeliveryAddress({ formattedAddress: text });

            }}
            errorText={errors.deliveryLocation?.message ? String(errors.deliveryLocation.message) : undefined}
          />

          <View style={appStyles.inputWrapper}>
            

            {delivery.loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[appStyles.helperText, { marginLeft: 8 }]}>Searching address...</Text>
              </View>
            ) : null}
            {errors.deliveryLocation?.message ? (
              <Text style={appStyles.errorText}>{String(errors.deliveryLocation.message)}</Text>
            ) : null}
            {delivery.showSuggestions ? (
              <View style={{ marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: colors.white }}>
                {delivery.suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.formattedAddress}-${index}`}
                    onPress={() => void handleDeliveryAddressSelect(item)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      borderBottomWidth: index === delivery.suggestions.length - 1 ? 0 : 1,
                      borderBottomColor: '#F1F5F9',
                    }}
                  >
                    <Text style={{ color: colors.textBody, fontWeight: '500' }}>{item.formattedAddress}</Text>
                    {item.distancekm != null ? (
                      <Text style={{ color: colors.textMuted, marginTop: 2 }}>{item.distancekm.toFixed(2)} km to nearest quarry</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>


          
          <FormField
            required=' *'
            label="Delivery Contact Person"
            placeholder="Enter contact name"
            icon="person-outline"
            keyboardType="default"
            control={control}
            name="deliveryContactPerson"
            errorText={errors.deliveryContactPerson?.message ? String(errors.deliveryContactPerson.message) : undefined}
          />

          <FormField
            required=' *'
            label="Delivery Phone"
            placeholder="Enter contact phone"
            icon="call-outline"
            keyboardType="number-pad"
            control={control}
            name="deliveryPhone"
            errorText={errors.deliveryPhone?.message ? String(errors.deliveryPhone.message) : undefined}
          />

          <View style={appStyles.inputWrapper}>
            <Text style={appStyles.formLabel}>Preferred Dispatch Date (Optional)</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowDispatchDatePicker(true)}
              style={[appStyles.inputContainer, { minHeight: 54, paddingHorizontal: 14 }]}
            >
              <Ionicons name="calendar-outline" size={20} color="#757575" style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, color: dispatchDateValue ? colors.text : colors.textMuted }}>
                {dispatchDateValue || 'YYYY-MM-DD'}
              </Text>
            </TouchableOpacity>
            {errors.dispatchDate?.message ? (
              <Text style={appStyles.errorText}>{String(errors.dispatchDate.message)}</Text>
            ) : null}
          </View>
          {showDispatchDatePicker ? (
            <DateTimePicker
              value={parseIsoDate(dispatchDateValue)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDispatchDateChange}
            />
          ) : null}

          <FormField
            required=''
            label="Cargo Description (Optional)"
            placeholder="Describe what will be transported"
            icon="cube-outline"
            control={control}
            name="cargoDescription"
            errorText={errors.cargoDescription?.message ? String(errors.cargoDescription.message) : undefined}
          />

          <View style={appStyles.uploadSection}>
            <Text style={appStyles.formLabel}>
              Media Upload <Text style={appStyles.requiredStar}>*</Text>
            </Text>
            <MediaUploadGrid
              files={mediaPicker.files}
              error={mediaPicker.error}
              maxFiles={5}
              onAdd={mediaPicker.pickMedia}
              onRemove={mediaPicker.removeMedia}
            />
          </View>

          <Text style={appStyles.formLabel}>Delivery Notes</Text>
          <TextInput
            style={[appStyles.notesInput, appStyles.notesTextArea]}
            multiline
            placeholder="Provide loading instructions, cargo handling notes, or dispatch guidance..."
            placeholderTextColor={colors.textSubtle}
            value={(watch('deliveryNotes') as string) || ''}
            onChangeText={(text) => setValue('deliveryNotes', text)}

          />

          <TouchableOpacity
            onPress={handleSubmit(async (data) => {
              await createOrderOnly(data);

              onContinue(data);
            })}
            style={[appStyles.submitButtonRounded, appStyles.submitButtonBottomSpace]}
          >
            <Text style={appStyles.submitButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showGoodsTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoodsTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowGoodsTypeModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Goods Type</Text>
            <Text style={styles.modalSubtitle}>Choose the cargo type that best matches the job.</Text>

            {GOODS_TYPE_OPTIONS.map((option, index) => {
              const isActive = selectedGoodsType === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.88}
                  onPress={() => {
                    setValue('goodsType', option.value, { shouldValidate: true });
                    if (option.value !== 'other') {
                      clearErrors('cargoDescription');
                    }
                    setShowGoodsTypeModal(false);
                  }}
                  style={[
                    styles.modalOption,
                    index === GOODS_TYPE_OPTIONS.length - 1 && styles.modalOptionLast,
                    isActive && styles.modalOptionActive,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalOptionTitle, isActive && styles.modalOptionTitleActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.modalOptionSubtitle, isActive && styles.modalOptionSubtitleActive]}>
                      {option.description}
                    </Text>
                  </View>
                  {isActive ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  truckSuggestionStack: {
    gap: 12,
  },
  dropdownMenu: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D6DFEA',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  dropdownOptionActive: {
    backgroundColor: '#EEF4FF',
  },
  dropdownOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textBody,
    marginBottom: 4,
  },
  dropdownOptionTitleActive: {
    color: colors.primary,
  },
  dropdownOptionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  dropdownOptionSubtitleActive: {
    color: '#35507A',
  },
  emptyTruckState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B8C4D6',
    borderRadius: 18,
    backgroundColor: '#F8FBFF',
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  emptyTruckTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textBody,
    marginBottom: 6,
  },
  emptyTruckText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  truckSuggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D6DFEA',
    backgroundColor: '#FFFFFF',
  },
  truckSuggestionCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F6F9FF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  truckSuggestionImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: '#EEF2F7',
  },
  truckSuggestionBody: {
    flex: 1,
    paddingRight: 2,
  },
  truckSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  truckSuggestionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textBody,
  },
  recommendationBadge: {
    backgroundColor: '#E7F9EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  recommendationBadgeActive: {
    backgroundColor: colors.primary,
  },
  recommendationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12B76A',
  },
  recommendationBadgeTextActive: {
    color: '#FFFFFF',
  },
  truckSuggestionDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: 8,
  },
  truckSuggestionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  capacityPill: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  capacityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  truckSuggestionMetaText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  truckSuggestionSmallText: {
    fontSize: 12,
    color: '#475467',
    lineHeight: 17,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textBody,
  },
  modalSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOptionLast: {
    marginBottom: 0,
  },
  modalOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF4FF',
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textBody,
    marginBottom: 4,
  },
  modalOptionTitleActive: {
    color: colors.primary,
  },
  modalOptionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  modalOptionSubtitleActive: {
    color: '#35507A',
  },
});

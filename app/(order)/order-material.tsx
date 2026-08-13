import FormField from '@/components/FormField';
import MediaUploadGrid from '@/components/MediaUploadGrid';
import { appStyles, colors } from "@/constants";
import { locationApi, orderApi } from '@/src/config/api';
import { useAddressAutocomplete } from '@/src/hooks/useAddressAutocomplete';
import { useOrderMediaPicker } from '@/src/hooks/useOrderMediaPicker';
import { OrderMaterialFormData, orderMaterialSchema } from '@/src/schemas/order.schema';
import { googlePlacesApi } from '@/src/services/googlePlaces';
import { handleSessionExpired } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';

const orderTypePills = [
  { key: 'materials', eyebrow: 'Supplies', label: 'Material', route: '/order-material' },
  { key: 'truck', eyebrow: 'Logistics', label: 'Truck', route: '/order-truck' },
] as const;

const pricingModePills = [
  { key: 'per_truck', label: 'Per Truck', extra: '(Fixed)' },
  { key: 'per_ton', label: 'Per Ton', extra: '(Weight-Based)' },
] as const;

const loadTypeOptions = [
  { key: 'FULL_LOAD', label: 'Full Truck' },
  { key: 'ONE_BULK_BAG', label: '1 Bulk Bag' },
  { key: 'HALF_BULK_BAG', label: 'Half Bulk Bag' },
] as const;

type AddressSuggestion = {
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  quarryId?: string;
  distancekm?: number;
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







export default function OrderMaterialForm() {
  const router = useRouter();
  const { accesstoken, logout, isLoading: isAuthLoading } = useAuth();

  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useLocalSearchParams<{ materialType?: string; orderType?: string; productId?: string; orderId: string; }>();
  const materialType = typeof params.materialType === 'string' ? params.materialType : '';
  const [isEstimateLoading, setIsEstimateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScheduledDatePicker, setShowScheduledDatePicker] = useState(false);
  const [showLoadTypeDropdown, setShowLoadTypeDropdown] = useState(false);
  const [resolvedProductId, setResolvedProductId] = useState(typeof params.productId === 'string' ? params.productId : '');
  const [resolvedQuarryId, setResolvedQuarryId] = useState('');
  const [resolvedDistanceKm, setResolvedDistanceKm] = useState<number | undefined>(undefined);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const mediaPicker = useOrderMediaPicker();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError: setFormError,
    watch,
  } = useForm<OrderMaterialFormData>({
    resolver: zodResolver(orderMaterialSchema),
    defaultValues: {
      orderType: 'materials',
      materialType,
      pricingMode: 'per_truck',
      loadType: undefined,
      quantityTons: '',
      deliveryAddress: '',
      deliveryContactPerson: '',
      deliveryPhone: '',
      scheduledDate: '',
      deliveryNotes: '',
    },
  });



  const address = useAddressAutocomplete({
    token: accesstoken ?? undefined,
    enabled: !isAuthLoading,
  });

  const handleAddressSelect = async (item: AddressSuggestion) => {
    address.select(item);
    setValue('deliveryAddress', item.formattedAddress, { shouldValidate: true });

    const productId = resolvedProductId || (typeof params.productId === 'string' ? params.productId : '');
    const pricingMode = watch('pricingMode');

    if (!productId || !pricingMode) {
      setResolvedQuarryId('');
      setResolvedDistanceKm(undefined);
      return;
    }

    try {
      const geocode = await googlePlacesApi.geocodeAddress(item.formattedAddress);
      if (!geocode) {
        setResolvedQuarryId('');
        setResolvedDistanceKm(undefined);
        return;
      }

      address.setSelected({
        ...item,
        formattedAddress: geocode.formattedAddress,
        latitude: geocode.latitude,
        longitude: geocode.longitude,

      });

      const payload = {
        address: geocode.formattedAddress,
        deliverylatitude: geocode.latitude,
        deliverylongitude: geocode.longitude,
        productid: productId,
        pricingmode: pricingMode,
      };

      const result = await locationApi.quarryByAddress(
        payload,
        accesstoken
      );

      if (result.success) {
        const quarry = result.data?.quarry;
        setResolvedQuarryId(quarry?.id ? String(quarry.id) : '');
        setResolvedDistanceKm(
          quarry?.distancekm != null ? Number(quarry.distancekm) : undefined
        );

        address.setSelected((prev) =>
          prev
            ? {
              ...prev,
              quarryId: quarry?.id ? String(quarry.id) : prev.quarryId,
              distancekm:
                quarry?.distancekm != null
                  ? Number(quarry.distancekm)
                  : prev.distancekm,
            }
            : prev
        );
      } else {
        setResolvedQuarryId('');
        setResolvedDistanceKm(undefined);
      }
    } catch {
      setResolvedQuarryId('');
      setResolvedDistanceKm(undefined);
    }
  };




  const createOrderOnly = async (data: OrderMaterialFormData): Promise<string | null> => {
    if (isSubmitting || isEstimateLoading) return null;

    setIsSubmitting(true);
    setError(null);

    let result: any = null;

    try {

      const buildMaterialPayload = (data: OrderMaterialFormData) => ({
        // Keep distance aliases to match varying backend field names.
        quarryid: resolvedQuarryId,
        deliveryaddress: data.deliveryAddress,
        deliverycontactperson: data.deliveryContactPerson,
        deliveryphone: data.deliveryPhone,
        distancekm: resolvedDistanceKm,
        pricingmode: data.pricingMode,
        loadtype: data.loadType,
        deliverylatitude: address.selected?.latitude,
        deliverylongitude: address.selected?.longitude,
        scheduled_date: data.scheduledDate,
        delivery_notes: data.deliveryNotes,

        items: [
          {
            productid: resolvedProductId,
            quantitytons: Number(data.quantityTons),


          },
        ],
      });

      const payload = buildMaterialPayload(data);



      const quarryId = payload.quarryid;
      const productId = payload?.items?.[0]?.productid;


      if (!quarryId) {
        setError('Please select a delivery address linked to a valid quarry before submitting.');
        return null;
      }
      if (!productId) {
        setError('Selected product is invalid. Please reselect a product and try again.');
        return null;
      }



      result = await orderApi.createMaterialOrder(payload as any, accesstoken);




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




  const onContinue = (data: OrderMaterialFormData) => {

    const productId = resolvedProductId || (typeof params.productId === 'string' ? params.productId : '');
    const quarryId = resolvedQuarryId || address.selected?.quarryId;

    if (!productId) {
      setFormError('materialType', { type: 'manual', message: 'Please select a valid product before continuing.' });
      return;
    }

    if (!quarryId) {
      setFormError('deliveryAddress', {
        type: 'manual',
        message: 'Please choose a suggested delivery address so a valid quarry can be selected.',
      });
      return;
    }

    router.push({
      pathname: '/estimate-summary',
      params: {
        source: "new-order",
        data: JSON.stringify({
          orderType: data.orderType,
          materialType: data.materialType,
          productId,
          quarryId,
          pricingMode: data.pricingMode,
          loadType: data.loadType,

          quantityTons: Number(data.quantityTons),
          deliveryAddress: data.deliveryAddress,
          deliveryContactPerson: data.deliveryContactPerson,
          deliveryContactPhone: data.deliveryPhone,
          deliveryLatitude: address.selected?.latitude,
          deliveryLongitude: address.selected?.longitude,

          distanceKm: address.selected?.distancekm,
          scheduledDate: data.scheduledDate ?? '',
          deliveryNotes: data.deliveryNotes ?? '',
          mediaFiles: mediaPicker.files,
        }),
      },
    });
  };


  const scheduledDateValue = watch('scheduledDate');
  const onScheduledDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowScheduledDatePicker(false);
    }
    if (event.type !== 'set' || !date) return;
    setValue('scheduledDate', formatDate(date), { shouldValidate: true });
  };

  return (
    <SafeAreaView style={appStyles.containerWhite} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? -300 : 0}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={appStyles.pageHeaderBetween}>
          <TouchableOpacity onPress={() => router.dismissTo('/(tabs)/order')} style={appStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={appStyles.pageHeaderTitle}>Order Materials</Text>
          <View style={appStyles.pageHeaderSpacer} />
        </View>

        <ScrollView contentContainerStyle={[appStyles.summaryScrollContent, { flexGrow: 1 }]} showsVerticalScrollIndicator={false}>
          <View style={appStyles.tabSectionTight}>
            <Text style={appStyles.switcherLabel}>Order Type</Text>
            <View style={[appStyles.segmentedControl, appStyles.segmentedControlWithSpacing]}>

              {orderTypePills.map((pill) => {
                const isActive = pill.key === 'materials';

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

          <Text style={appStyles.summaryTitle}>Material Request Details</Text>
          <Text style={appStyles.summarySubtitle}>
            Provide your material quantity and delivery details to continue.
          </Text>

          <FormField
            label="Material Type"
            required='*'
            readOnly
            placeholder="e.g. Granite"

            control={control}
            name="materialType"
            errorText={errors.materialType?.message ? String(errors.materialType.message) : undefined}
          />

          <View style={appStyles.tabSectionTight}>
            <Text style={appStyles.switcherLabel}>
              Pricing Mode <Text style={appStyles.requiredStar}>*</Text>
            </Text>
            <View style={[appStyles.segmentedControl, appStyles.segmentedControlWithSpacing]}>
              {pricingModePills.map((pill) => {
                const isActive = watch('pricingMode') === pill.key;

                return (
                  <TouchableOpacity
                    key={pill.key}
                    activeOpacity={0.9}
                    onPress={() => setValue('pricingMode', pill.key)}
                    style={[appStyles.segmentedTab, appStyles.segmentedTabPricingMode, isActive && appStyles.segmentedTabActive]}
                  >
                    <Text style={[appStyles.segmentedText, appStyles.segmentedTextCentered, isActive && appStyles.segmentedTextActive]}>
                      {pill.label}{' '}
                      <Text style={[appStyles.segmentedTextSubtle, isActive && appStyles.segmentedTextSubtleActive]}>{pill.extra}</Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.pricingMode?.message ? (
              <Text style={appStyles.errorText}>{String(errors.pricingMode.message)}</Text>
            ) : null}
          </View>

          <FormField
            label="Quantity"
            required='*'
            placeholder="e.g. 30"
            icon="speedometer-outline"
            keyboardType="decimal-pad"
            control={control}
            name="quantityTons"
            errorText={errors.quantityTons?.message ? String(errors.quantityTons.message) : undefined}
          />

          {watch('pricingMode') === 'per_truck' ? (
            <View style={appStyles.tabSectionTight}>
              <Text style={appStyles.switcherLabel}>
                Truck Load Type <Text style={appStyles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowLoadTypeDropdown(true)}
                style={[appStyles.inputContainer, { marginBottom: 12, paddingHorizontal: 14, minHeight: 54 }]}
              >
                <Ionicons name="car-outline" size={20} color="#757575" style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, color: watch('loadType') ? colors.text : colors.textMuted }}>
                  {loadTypeOptions.find((option) => option.key === watch('loadType'))?.label ?? 'Select truck load type'}
                </Text>
                <Ionicons name="chevron-down-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              {errors.loadType?.message ? (
                <Text style={appStyles.errorText}>{String(errors.loadType.message)}</Text>
              ) : null}
            </View>
          ) : null}


          <FormField
            required=' *'
            label="Delivery Address"
            placeholder="Enter full delivery address"
            value={address.input}
            icon="location-outline"
            keyboardType="default"
            control={control}
            name="deliveryLocation"
            onChangeText={(text) => {
              address.setInput(text);
              setValue('deliveryAddress', text, { shouldValidate: true });
              if (resolvedQuarryId) setResolvedQuarryId('');
            }}
            errorText={errors.deliveryAddress?.message ? String(errors.deliveryAddress.message) : undefined}
          />

          <View style={appStyles.inputWrapper}>

            {address.loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[appStyles.helperText, { marginLeft: 8 }]}>Searching address...</Text>
              </View>
            ) : null}
            {errors.deliveryAddress?.message ? (
              <Text style={appStyles.errorText}>{String(errors.deliveryAddress.message)}</Text>
            ) : null}
            {address.showSuggestions ? (
              <View style={{ marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: colors.white }}>
                {address.suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.formattedAddress}-${index}`}
                    onPress={() => handleAddressSelect(item)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      borderBottomWidth: index === address.suggestions.length - 1 ? 0 : 1,
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
            <Text style={appStyles.formLabel}>Delivery Date</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowScheduledDatePicker(true)}
              style={[appStyles.inputContainer, { minHeight: 54, paddingHorizontal: 14 }]}
            >
              <Ionicons name="calendar-outline" size={20} color="#757575" style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, color: scheduledDateValue ? colors.text : colors.textMuted }}>
                {scheduledDateValue || 'YYYY-MM-DD'}
              </Text>
            </TouchableOpacity>
            {errors.scheduledDate?.message ? (
              <Text style={appStyles.errorText}>{String(errors.scheduledDate.message)}</Text>
            ) : null}
          </View>
          {showScheduledDatePicker ? (
            <DateTimePicker
              value={parseIsoDate(scheduledDateValue)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onScheduledDateChange}
            />
          ) : null}

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
            placeholder="Provide site access details, offloading instructions, or anything the driver should know..."
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
        visible={showLoadTypeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoadTypeDropdown(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}
          activeOpacity={1}
          onPress={() => setShowLoadTypeDropdown(false)}
        >
          <View style={{ backgroundColor: colors.white, borderRadius: 16, paddingVertical: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textBody, paddingHorizontal: 16, paddingVertical: 10 }}>
              Select Truck Load Type
            </Text>
            {loadTypeOptions.map((option) => {
              const isActive = watch('loadType') === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setValue('loadType', option.key, { shouldValidate: true });
                    setShowLoadTypeDropdown(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isActive ? '#EEF4FF' : colors.white,
                  }}
                >
                  <Text style={{ color: isActive ? colors.primary : colors.textBody, fontWeight: isActive ? '700' : '500' }}>
                    {option.label}
                  </Text>
                  {isActive ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

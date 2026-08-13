import { appStyles, colors } from '@/constants';
import { notificationApi } from '@/src/config/api';
import { handleSessionExpired } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';

type UiNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  readAt: string;
  isRead: boolean;
};

const normalizeTypeLabel = (value: unknown): string => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'order') return 'Order';
  if (normalized === 'wallet') return 'Wallet';
  if (normalized === 'promotion') return 'Promotion';
  return 'System';
};

const formatDateTime = (raw?: string): string => {
  if (!raw) return '-';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationDetailsScreen() {
  const router = useRouter();
  const { accesstoken, logout } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const notificationId = typeof params.id === 'string' ? params.id : '';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<UiNotification | null>(null);

  const loadNotification = useCallback(async () => {
    if (!notificationId) {
      setError('Notification ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await notificationApi.getNotificationDetails(notificationId, accesstoken);
    if (await handleSessionExpired(result, logout, (path) => router.replace(path as any))) return;

    if (!result?.success) {
      setError(result?.message || 'Failed to load notification details.');
      setIsLoading(false);
      return;
    }

    const raw = (result.data as any) ?? {};
    const isRead = Boolean(raw.isread === 1 || raw.isread === true || raw.readat);

    setNotification({
      id: String(raw.id ?? notificationId),
      title: String(raw.title ?? 'Notification'),
      message: String(raw.message ?? ''),
      type: normalizeTypeLabel(raw.type),
      createdAt: formatDateTime(raw.createdat),
      readAt: formatDateTime(raw.readat),
      isRead,
    });

    setIsLoading(false);
  }, [accesstoken, logout, notificationId, router]);

  useEffect(() => {
    loadNotification();
  }, [loadNotification]);

  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={appStyles.orderDetailsHeader}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Notification Details</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <ScrollView contentContainerStyle={appStyles.orderDetailsScroll}>
        {isLoading ? (
          <View style={appStyles.ordersEmptyState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={appStyles.ordersEmptyText}>Loading notification...</Text>
          </View>
        ) : error ? (
          <View style={appStyles.ordersEmptyState}>
            <Text style={appStyles.ordersEmptyTitle}>Could not load notification</Text>
            <Text style={appStyles.ordersEmptyText}>{error}</Text>
            <TouchableOpacity
              onPress={loadNotification}
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
                  <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                </View>
                <View style={appStyles.summaryLocationTextWrap}>
                  <Text style={appStyles.summaryLocationName}>{notification?.title ?? 'Notification'}</Text>
                  <View style={appStyles.summaryAddressRow}>
                    <Ionicons name="pricetag-outline" size={14} color="#757575" />
                    <Text style={appStyles.summaryAddressText}>{notification?.type ?? '-'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={appStyles.summaryCard}>
              <Text style={appStyles.summaryCardHeader}>Notification Info</Text>
              <View style={appStyles.divider} />
              <SummaryRow label="Received" value={notification?.createdAt ?? '-'} />
              <SummaryRow label="Read At" value={notification?.readAt ?? '-'} />
            </View>

            <View style={appStyles.summaryCard}>
              <Text style={appStyles.summaryCardHeader}>Message</Text>
              <View style={appStyles.divider} />
              <Text style={appStyles.summaryRowValue}>{notification?.message ?? '-'}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={appStyles.summaryRow}>
    <Text style={appStyles.summaryRowLabel}>{label}</Text>
    <Text style={appStyles.summaryRowValue}>{value}</Text>
  </View>
);

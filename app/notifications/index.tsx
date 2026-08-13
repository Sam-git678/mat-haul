import { appStyles, colors } from '@/constants';
import { notificationApi } from '@/src/config/api';
import type { NotificationItem } from '@/types/notification';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';
import { useNotifications } from '../context/notificationcontext';

type NotificationType = 'all' | 'order' | 'wallet' | 'system' | 'promotion';

const filters: Array<{ key: NotificationType; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'order', label: 'Order' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'system', label: 'System' },
  { key: 'promotion', label: 'Promotion' },
];

const normalizeType = (value: unknown): Exclude<NotificationType, 'all'> => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'order') return 'order';
  if (normalized === 'wallet') return 'wallet';
  if (normalized === 'promotion') return 'promotion';
  return 'system';
};

const formatTime = (raw?: string): string => {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const typeMeta: Record<Exclude<NotificationType, 'all'>, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  order: { icon: 'cube-outline', color: '#175CD3', bg: '#EFF8FF', label: 'Order' },
  wallet: { icon: 'wallet-outline', color: '#027A48', bg: '#ECFDF3', label: 'Wallet' },
  system: { icon: 'settings-outline', color: '#7A5AF8', bg: '#F4F3FF', label: 'System' },
  promotion: { icon: 'megaphone-outline', color: '#B54708', bg: '#FFFAEB', label: 'Promotion' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { accesstoken } = useAuth();
  const { setUnreadCount } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<NotificationType>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const result = await notificationApi.getNotifications(accesstoken);
    if (result?.success) {
      const rows = (result.data?.data ?? []) as NotificationItem[];
      setNotifications(rows);
      setUnreadCount(result.data?.unread_count ?? 0);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    setIsLoading(false);
  }, [accesstoken, setUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const normalizedNotifications = useMemo(
    () =>
      notifications.map((item) => {
        const type = normalizeType(item.type);
        const isRead = Boolean(item.isread === 1 || item.isread === true || item.readat);
        return {
          ...item,
          type,
          isRead,
          timeText: formatTime(item.createdat),
        };
      }),
    [notifications]
  );

  const counts = useMemo(
    () => ({
      all: normalizedNotifications.length,
      order: normalizedNotifications.filter((n) => n.type === 'order').length,
      wallet: normalizedNotifications.filter((n) => n.type === 'wallet').length,
      system: normalizedNotifications.filter((n) => n.type === 'system').length,
      promotion: normalizedNotifications.filter((n) => n.type === 'promotion').length,
    }),
    [normalizedNotifications]
  );

  const unreadTotal = useMemo(
    () => normalizedNotifications.filter((n) => !n.isRead).length,
    [normalizedNotifications]
  );

  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? normalizedNotifications
        : normalizedNotifications.filter((n) => n.type === activeFilter),
    [activeFilter, normalizedNotifications]
  );

  const onOpenNotification = useCallback((item: NotificationItem) => {
    const id = String(item.id ?? '');
    if (!id) return;
    router.push({
      pathname: '/notifications/notification-details',
      params: { id },
    });
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={appStyles.header}>
        <TouchableOpacity style={appStyles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.headerTitleText}>Notifications</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/notifications/settings')}
          activeOpacity={0.85}
        >
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryTitle}>Inbox</Text>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unreadTotal} unread</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter.key)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter.label} ({counts[filter.key]})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        }
        renderItem={({ item }) => {
          const type = normalizeType(item.type);
          const meta = typeMeta[type];
          const isRead = Boolean((item as any).isRead);
          const timeText = String((item as any).timeText ?? '');

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => onOpenNotification(item)}
            >
              <View style={styles.cardTop}>
                <View style={[styles.typeBadge, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={14} color={meta.color} />
                  <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <Text style={styles.timeText}>{timeText}</Text>
              </View>

              <View style={styles.titleRow}>
                <Text style={styles.titleText}>{String(item.title ?? 'Notification')}</Text>
                {!isRead ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={styles.messageText}>{String(item.message ?? '')}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.emptyBody}>Loading notifications...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyBody}>New updates for orders, wallet, system, and promotions will appear here.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadBadge: {
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  unreadText: {
    fontSize: 12,
    color: '#3538CD',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 120,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#0B4A8B',
    borderColor: '#0B4A8B',
  },
  filterText: {
    fontSize: 12,
    color: '#344054',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: '#667085',
    fontWeight: '500',
  },
  titleText: {
    fontSize: 15,
    color: '#101828',
    fontWeight: '700',
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#2F6FED',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 13,
    color: '#475467',
    lineHeight: 19,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyBody: {
    marginTop: 6,
    textAlign: 'center',
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },
});

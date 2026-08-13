import { SummaryRow } from '@/components/SummaryRows';
import { appStyles, colors } from '@/constants';
import { ReceiptParams, UiTransaction } from '@/types/wallet';
import { getStatusStyles } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const normalizeType = (value?: string) => {
  const type = String(value ?? '').toLowerCase();
  if (type === 'debit' || type === 'withdrawal' || type === 'payment') return 'debit';
  return 'credit';
};





export default function TransactionDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ReceiptParams>();


  const transactionId = typeof params.transactionId === 'string' ? params.transactionId : '-';
  const title = typeof params.title === 'string' ? params.title : 'Wallet Transaction';
  const amount = typeof params.amount === 'string' ? params.amount : 'NGN 0';
  const date = typeof params.date === 'string' ? params.date : '-';
  const time = typeof params.time === 'string' ? params.time : '--:--';
  const statusRaw = params.status as UiTransaction['status'] ?? 'Pending';
  const type = normalizeType(typeof params.type === 'string' ? params.type : undefined);
  const reference = typeof params.reference === 'string' ? params.reference : transactionId;
  const balance = typeof params.balance === 'string' ? params.balance : '-';
  const description = typeof params.description === 'string' ? params.description : title;
  const statusStyles = getStatusStyles(statusRaw);
  const receiptRef = reference !== '-' ? reference : `WRCPT-${String(transactionId).replace(/\s+/g, '').toUpperCase()}`;

  const onShareReceipt = async () => {
    await Share.share({
      message:
        `Wallet Receipt\n` +
        `Reference: ${receiptRef}\n` +
        `Transaction ID: ${transactionId}\n` +
        `Type: ${type}\n` +
        `Description: ${description}\n` +
        `Amount: ${amount}\n` +
        `Date: ${date}\n` +
        `Time: ${time}\n` +
        `Status: ${statusRaw}` +
        (balance !== '-' ? `\nBalance: ${balance}` : ''),
    });
  };

  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={appStyles.orderDetailsHeader}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Transaction Details</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={appStyles.homeContent}
      >

        <View style={styles.heroCard}>
          <View style={[styles.iconWrap, { backgroundColor: statusStyles.bg }]}>
            <View style={[styles.iconInner, { backgroundColor: statusStyles.text }]}>
              <Ionicons name={statusRaw === 'Pending' ? 'time-outline' : 'checkmark'} size={30} color='#ffffff' />
            </View>
          </View>

          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroAmount}>
            {type === 'debit' ? '-' : '+'}{amount}
          </Text>

          <View style={[styles.statusBadge, { backgroundColor: statusStyles.bg }]}>
            <Text style={[styles.statusText, { color: statusStyles.text }]}>{statusRaw}</Text>
          </View>
        </View>

        <View style={appStyles.summaryCard}>
          <Text style={appStyles.summaryCardHeader}>Transaction Details</Text>

          <SummaryRow label="Receipt Ref" value={receiptRef} />
          <SummaryRow label="Transaction ID" value={transactionId} />
          <SummaryRow label="Description" value={description} />
          <SummaryRow label="Type" value={type === 'debit' ? 'Debit' : 'Credit'} />
          <SummaryRow label="Amount" value={amount} />
          <SummaryRow label="Date" value={date} />
          <SummaryRow label="Time" value={time} />

        </View>


        <View style={appStyles.row}>

          <AppButton
            title="Share Receipt"
            onPress={onShareReceipt}
            icon={<Ionicons name="share-social-outline" size={16} color="#FFFFFF" style={styles.shareIcon} />}
            style={appStyles.halfButtonPrimary}
            textStyle={appStyles.halfButtonPrimaryText}
          />

          <AppButton
            title="Report an Issue"
            onPress={() => router.push('/')}
            icon={<Ionicons name="warning-outline" size={16} color={colors.primary} style={styles.shareIcon} />}
            style={appStyles.halfButtonSecondary}
            textStyle={appStyles.halfButtonSecondaryText}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heroCard: {

    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(100, 179, 236, 0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(54, 89, 146, 0.43)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroAmount: {
    color: '#000000',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  statusBadge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  summaryRowLabel: {
    flex: 1,
    fontSize: 14,
    color: '#667085',
  },
  summaryRowValue: {
    flex: 1,
    fontSize: 14,
    color: '#101828',
    fontWeight: '600',
    textAlign: 'right',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
  },
  shareButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareIcon: {
    marginTop: 1,
  },
  secondaryButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },

  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#344054',
  },
});

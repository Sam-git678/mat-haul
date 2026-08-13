import { appStyles, colors } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReceiptParams = {
  orderId?: string;
  title?: string;
  amount?: string;
  orderDate?: string;
  status?: string;
  orderType?: string;
};

export default function OrderReceiptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ReceiptParams>();

  const orderId = typeof params.orderId === 'string' ? params.orderId : '-';
  const title = typeof params.title === 'string' ? params.title : 'Order';
  const amount = typeof params.amount === 'string' ? params.amount : 'NGN 0';
  const orderDate = typeof params.orderDate === 'string' ? params.orderDate : '-';
  const status = typeof params.status === 'string' ? params.status : '-';
  const orderType = typeof params.orderType === 'string' ? params.orderType : '-';
  const receiptRef = `RCPT-${String(orderId).replace(/\s+/g, '').toUpperCase()}`;
  const humanOrderType =
    orderType === 'truck' ? 'Truck Hire' : orderType === 'materials' ? 'Material Order' : orderType;

  const onShareReceipt = async () => {
    await Share.share({
      message:
        `Order Receipt\n` +
        `Reference: ${receiptRef}\n` +
        `Order ID: ${orderId}\n` +
        `Order Type: ${orderType}\n` +
        `Description: ${title}\n` +
        `Amount Paid: ${amount}\n` +
        `Order Date: ${orderDate}\n` +
        `Status: ${status}`,
    });
  };

  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={appStyles.orderDetailsHeader}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Order Receipt</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <View style={appStyles.orderDetailsScroll}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="checkmark-done-circle" size={28} color="#12B76A" />
          </View>
          <Text style={styles.heroTitle}>Payment Successful</Text>
          <Text style={styles.heroSubtitle}>Your order payment has been received.</Text>
        </View>

        <View style={appStyles.summaryCard}>
          <Text style={appStyles.summaryCardHeader}>Payment Receipt</Text>
          <View style={appStyles.divider} />
          <Text style={styles.amountLabel}>Amount Paid</Text>
          <Text style={styles.amountValue}>{amount}</Text>
          <View style={styles.amountDivider} />
          <SummaryRow label="Receipt Ref" value={receiptRef} />
          <SummaryRow label="Order ID" value={orderId} />
          <SummaryRow label="Order Type" value={humanOrderType} />
          <SummaryRow label="Description" value={title} />
          <SummaryRow label="Order Date" value={orderDate} />
          <SummaryRow label="Status" value={status} />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onShareReceipt}
            style={[appStyles.submitButtonRounded, styles.secondaryButton]}
            activeOpacity={0.85}
          >
            <Text style={[appStyles.submitButtonText, styles.secondaryButtonText]}>Share Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/order')}
            style={[appStyles.submitButtonRounded, styles.primaryButton]}
            activeOpacity={0.85}
          >
            <Text style={appStyles.submitButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={appStyles.summaryRow}>
    <Text style={appStyles.summaryRowLabel}>{label}</Text>
    <Text style={appStyles.summaryRowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#667085',
  },
  amountLabel: {
    fontSize: 12,
    color: '#667085',
  },
  amountValue: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '800',
    color: '#101828',
  },
  amountDivider: {
    marginTop: 12,
    marginBottom: 8,
    height: 1,
    backgroundColor: '#EAECF0',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },
  secondaryButtonText: {
    color: '#344054',
  },
  primaryButton: {
    flex: 1,
  },
});

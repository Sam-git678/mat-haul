import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { appStyles, colors } from '@/constants';
import { walletApi } from '@/src/config/api';
import { CardTopupFormData, cardSchema } from "@/src/schemas/card.schema";
import { formatNaira } from '@/utils/helper';
import { useAuth } from '../context/authcontext';

const BRAND_BLUE = '#0B4A8B';

export default function CardPaymentScreen() {
  const router = useRouter();
  const { accesstoken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CardTopupFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      amount: '',

    },
  });

  const presetAmounts = [50000, 100000, 200000];

  const onSubmit = async (data: CardTopupFormData) => {
    const amountValue = Number(data.amount.replace(/,/g, ''));
    const payload = {
      amount: Number.isFinite(amountValue) ? amountValue : 0,
      method: 'alatpay',
    };

    try {
      setIsSubmitting(true);
      
      const result = await walletApi.topUpWallet(payload, accesstoken);
      if (!result?.success) {
        Alert.alert('Top-up failed', result?.message || 'Unable to process top-up right now.');
        return;
      }

      router.push({
        pathname: '/alatpay-checkout' as any,
        params: {
          payment: JSON.stringify(result.data),
          flow: 'wallet-topup',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={appStyles.pageHeaderBetween}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.backButton}>
          <Ionicons name="arrow-back" size={22} color={BRAND_BLUE} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Card Top-up</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>


        <View style={styles.amountCard}>
          <Text style={styles.sectionTitle}>Fund Wallet</Text>
          <Text style={styles.label}>Enter Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currency}>NGN</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.mainInput}
                  value={value}
                  onChangeText={(text) => {
                    const formatted = formatNaira(text);
                    onChange(formatted);
                  }}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSubtle}
                />
              )}
            />
          </View>
          {errors.amount ? <Text style={styles.errorText}>{errors.amount.message}</Text> : null}

          <View style={styles.presetAmountsContainer}>
            {presetAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setValue('amount', value.toString())}
                style={styles.presetAmountBtn}
              >
                <Text>₦{value.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, isSubmitting && styles.continueBtnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.continueText}>{isSubmitting ? 'Processing...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: BRAND_BLUE },
  headerSubText: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 16 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    marginBottom: 14,
  },
  presetAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  presetAmountBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,  
    backgroundColor: '#F3F6FA',
    borderRadius: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 54,
    backgroundColor: '#FCFDFE',
    marginBottom: 14,
  },
  currency: { fontSize: 13, fontWeight: '700', marginRight: 8, color: '#1E293B' },
  cardBrandMark: {
    width: 28,
    height: 18,
    marginRight: 10,
    justifyContent: 'center',
  },
  brandDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  brandDotLeft: {
    left: 2,
    backgroundColor: '#EB001B',
  },
  brandDotRight: {
    left: 12,
    backgroundColor: '#F79E1B',
  },
  mainInput: { flex: 1, fontSize: 15, color: '#1E293B' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfFieldLeft: { flex: 1, marginRight: 8 },
  halfFieldRight: { flex: 1, marginLeft: 8 },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: -6, marginBottom: 12 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8EEF5',
  },
  continueBtn: {
    backgroundColor: BRAND_BLUE,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.7 },
  continueText: { color: 'white', fontWeight: '700', fontSize: 16 },
});

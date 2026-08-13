import AlatPayCheckout from "@/components/AlatPayCheckout";
import LoaderModal from "@/components/LoaderModal";
import ProcessingPaymentModal from '@/components/ProcessingPaymentModal';
import { orderApi, walletApi } from '@/src/config/api';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './context/authcontext';
import { useWallet } from './context/walletcontext';

export default function AlatPayCheckoutScreen() {
    const { accesstoken } = useAuth();
    const { refreshWallet } = useWallet();
    const router = useRouter();
    
    const [checkoutLoading, setCheckoutLoading] = useState(true);
    const [processingVisible, setProcessingVisible] = useState(false);
    const params = useLocalSearchParams<{ payment?: string | string[]; flow?: string | string[] }>();

    const paymentParam = Array.isArray(params.payment) ? params.payment[0] : params.payment;
    const flowParam = Array.isArray(params.flow) ? params.flow[0] : params.flow;
    const paymentData = React.useMemo(() => {
        if (!paymentParam) {
            return null;
        }

        try {
            return JSON.parse(paymentParam);
        } catch (error) {
            return null;
        }
    }, [paymentParam]);

    if (!paymentData) {
        return null;
    }

    const paymentReference = paymentData?.reference ?? '';
    const paymentAmount = paymentData?.amount ?? 0;
    const isWalletTopUp = flowParam === 'wallet-topup' || !paymentData?.orderid;

    const handleVerifyPayment = async (providerTransactionId: string) => {
      if (processingVisible) {
        return;
      }

      setProcessingVisible(true);
      try {
        if (isWalletTopUp) {
          const verifyTopUpResult = await walletApi.verifyTopUp(
            {
              reference: paymentData.reference,
              provider_transaction_id: providerTransactionId,
            },
            accesstoken
          );

          if (!verifyTopUpResult?.success) {
            throw new Error(verifyTopUpResult?.message || 'Wallet top-up verification failed.');
          }

          await refreshWallet();
          router.replace({
            pathname: '/topup-success',
            params: {
              amount: String(verifyTopUpResult.data?.amount ?? paymentData.amount ?? ''),
              method: 'Card Payment',
            },
          });
          return;
        }

        const verifyOrderPayment = await orderApi.verifyPayment(
          paymentData.orderid,
          {
            reference: paymentData.reference,
            provider_transaction_id: providerTransactionId,
          },
          accesstoken
        );
      } catch (error) {
        Alert.alert(
          "Payment verification failed",
          "We could not confirm this payment right now. Please try again."
        );
      } finally {
        setProcessingVisible(false);
      }
    };

    return (
        <>
            <AlatPayCheckout
                payment={paymentData}
                onLoadStart={() => setCheckoutLoading(true)}
                onLoadEnd={() => setCheckoutLoading(false)}
                onReady={() => setCheckoutLoading(false)}
                onResult={async (response) => {
                    setCheckoutLoading(false);
                    await handleVerifyPayment(response.data.id);
                }}
                onError={(message) => {
                    setCheckoutLoading(false);
                    Alert.alert("Checkout unavailable", message);
                }}
                onClose={() => router.back()}
            />

            <LoaderModal
                visible={checkoutLoading}
                title="Opening checkout"
                message="Please wait while we load the secure payment form."
                subtext="Do not refresh or close this page."
            />

            <ProcessingPaymentModal
                visible={processingVisible}
                reference={paymentReference}
                amount={paymentAmount}
                onClose={() => setProcessingVisible(false)}
                onCheckStatus={() => handleVerifyPayment(paymentData.transaction_id)}
            />
            
        </>

    );
}

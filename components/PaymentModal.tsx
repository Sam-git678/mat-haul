import { useWallet } from "@/app/context/walletcontext";
import { appStyles } from "@/constants";
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const BRAND_BLUE = '#0B4A8B';

export default function PaymentModal({
    visible,
    onClose,
    onRequestPin,
    estimatedCost
}: {
    visible: boolean;
    onClose: () => void;
    onRequestPin: () => void;
    estimatedCost: number;
}) {
    const router = useRouter();
    const { balance, refreshWallet } = useWallet();
    const [isChecked, setIsChecked] = useState(false);

    const insufficientBalance = (balance ?? 0) < estimatedCost;
    const isDisabled = !isChecked || insufficientBalance;


    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            {/* Dimmed Overlay */}
            <Pressable style={styles.overlay} onPress={onClose}>

                {/* Modal Container */}
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Wallet & Payment</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Amount Display */}
                    <View style={styles.amountCard}>
                        <Text style={styles.amountLabel}>Estimated Total</Text>
                        <Text style={styles.amountValue}>₦{estimatedCost.toLocaleString()}</Text>
                    </View>

                    <View style={appStyles.errorContainer}>
                        <Text style={{fontWeight: 'bold', color: '#d9534f'}}>Note:</Text>
                        <Text style={appStyles.errorText}>Final price will be confirmed after admin review</Text>
                    </View>

                  
                    {/* Payment Method Section */}
                    <Text style={[styles.sectionLabel, {marginTop: 8}]}>Payment Method</Text>
                    <View style={styles.methodRow}>
                        <View style={styles.walletIcon}>
                            <Ionicons name="wallet" size={20} color={BRAND_BLUE} />
                        </View>
                        <View style={styles.walletDetails}>
                            <Text style={styles.walletBalance}>Wallet - ₦{(balance ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
                            {insufficientBalance && (
                                <Text style={styles.insufficient}>Insufficient Balance</Text>
                        
                            )}
                        </View>
                        <TouchableOpacity onPress={() => router.replace("/wallet-topup")} style={styles.addMoneyBtn}>
                            <Text style={styles.addMoneyText}>+ Add Money</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Authorization Checkbox Area */}
                    <Pressable style={styles.authRow}>
                        <Checkbox
                            value={isChecked}
                            onValueChange={setIsChecked}
                            color={isChecked ? BRAND_BLUE : undefined}
                        />
                        <Text style={styles.authText}>
                            I authorize Charissatics to deduct the estimated amount from my wallet...
                        </Text>
                    </Pressable>

                    <TouchableOpacity 
                        onPress={onRequestPin}
                        disabled={isDisabled}
                        style={[styles.payButton, 
                            isDisabled && appStyles.buttonDisabled
                        ]} >
                        <Text style={styles.payText}>Pay & Submit Order</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    headerTitle: { fontSize: 16, fontWeight: '600' },
    amountCard: { backgroundColor: '#eef2f6', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 10 },
    amountLabel: { color: BRAND_BLUE, fontSize: 14, marginBottom: 5 },
    amountValue: { fontSize: 28, fontWeight: 'bold', color: BRAND_BLUE },
    sectionLabel: { fontWeight: '600', marginBottom: 10 },
    methodRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12 },
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

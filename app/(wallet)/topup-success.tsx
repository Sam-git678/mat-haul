import { appStyles } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const BRAND_BLUE = '#0B4A8B';

export default function TopupSuccessScreen() {
    const router = useRouter();
    const { amount, method } = useLocalSearchParams<{ 
        amount?: string; 
        method?: string; 
    }>();

    

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.content}>
                {/* Checkmark Animation/Icon Section */}
                <View style={styles.iconContainer}>
                    <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                            <Ionicons name="checkmark" size={60} color="white" />
                        </View>
                    </View>
                    {/* Decorative shapes can be added here with absolute positioning */}
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.successTitle}>Wallet Funded Successfully!</Text>
                    <Text style={styles.successSub}>
                        You added <Text style={styles.amountText}>₦{amount}</Text> to your wallet via {method || 'Bank Transfer'}
                    </Text>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.receiptBtn}
                        onPress={()=> router.replace("/transaction-history")}
                    >
                        <Text style={styles.receiptText}>View Transactions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.doneBtn}
                        onPress={() => router.replace('/change-transaction-pin')}
                    >
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: appStyles.containerWhite,
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
    iconContainer: { marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
    outerCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#E6FFFA', alignItems: 'center', justifyContent: 'center' },
    innerCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#38B2AC', alignItems: 'center', justifyContent: 'center' },
    textContainer: { alignItems: 'center', marginBottom: 60 },
    successTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
    successSub: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 22 },
    amountText: { color: '#38B2AC', fontWeight: 'bold' },
    footer: { width: '100%', gap: 15 },
    receiptBtn: { width: '100%', height: 55, borderRadius: 30, borderWidth: 1, borderColor: '#38B2AC', justifyContent: 'center', alignItems: 'center' },
    receiptText: { color: '#38B2AC', fontWeight: 'bold', fontSize: 16 },
    doneBtn: { width: '100%', height: 55, borderRadius: 30, backgroundColor: '#38B2AC', justifyContent: 'center', alignItems: 'center' },
    doneText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});


import { appStyles } from "@/constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    Share,
    StatusBar,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { showSuccessToast } from "@/src/services/toast";

const BRAND_BLUE = '#0B4A8B';

export default function TopUpScreen() {
    const router = useRouter();


    const accountDetails = {
        bankName: "First Bank",
        accountName: "Charismats",
        accountNumber: "3118635931",
        referenceCode: "Y863SF2Y"
    };

    const copyToClipboard = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);

        showSuccessToast(`${label} copied!`);
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `Payment Details for Charissatics:\nBank: ${accountDetails.bankName}\nAccount: ${accountDetails.accountNumber}\nName: ${accountDetails.accountName}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={appStyles.pageHeaderBetween}>
                <TouchableOpacity onPress={() => router.back()} style={appStyles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={BRAND_BLUE} />
                </TouchableOpacity>
                <Text style={appStyles.pageHeaderTitle}>Wallet Top-up</Text>
                <View style={appStyles.pageHeaderSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.whiteCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="bank" size={24} color={BRAND_BLUE} />
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.sectionTitle}>Via Bank Transfer</Text>
                            <Text style={styles.sectionSub}>Free Instant bank funding within 10s</Text>
                        </View>
                    </View>

                    <View style={styles.dashedBox}>
                        <Text style={styles.label}>Bank Name</Text>
                        <View style={styles.bankInfoRow}>
                            {/* Replace with your local asset path */}
                            <Ionicons name="business" size={18} color={BRAND_BLUE} style={{ marginRight: 8 }} />
                            <Text style={styles.valueText}>{accountDetails.bankName}</Text>
                        </View>

                        <Text style={styles.label}>Account Name</Text>
                        <Text style={styles.valueText}>{accountDetails.accountName}</Text>

                        <Text style={styles.label}>Account Number</Text>
                        <View style={styles.copyRow}>
                            <Text style={styles.accountNumberText}>{accountDetails.accountNumber}</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(accountDetails.accountNumber, "Account Number")}>
                                <Ionicons name="copy-outline" size={20} color={BRAND_BLUE} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Reference Code</Text>
                        <View style={styles.copyRow}>
                            <Text style={styles.accountNumberText}>{accountDetails.referenceCode}</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(accountDetails.referenceCode, "Reference Code")}>
                                <Ionicons name="copy-outline" size={20} color={BRAND_BLUE} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
                            <Ionicons name="share-outline" size={18} color="white" />
                            <Text style={styles.shareText}>Share Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* OR Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                </View>

                {/* Card Top-up Section */}
                <TouchableOpacity onPress={() => router.push("/card-topup")} style={styles.cardOptionBtn}>
                    <View style={styles.smallIconCircle}>
                        <Ionicons name="card-outline" size={20} color={BRAND_BLUE} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.optionTitle}>Card Top-up</Text>
                        <Text style={styles.optionSub}>Add money from your bank card/account</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 10 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
    backButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: BRAND_BLUE },
    scrollContent: { padding: 20 },
    whiteCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
    dashedBox: {
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 15,
        backgroundColor: '#F8FBFF'
    },
    label: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    valueText: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 18 },
    bankInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    copyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    accountNumberText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
    shareBtn: { backgroundColor: BRAND_BLUE, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, marginTop: 10 },
    shareText: { color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 15 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
    line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    orText: { marginHorizontal: 15, color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
    cardOptionBtn: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 15, elevation: 1 },
    smallIconCircle: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    optionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    optionSub: { fontSize: 12, color: '#64748B', marginTop: 2 }
});

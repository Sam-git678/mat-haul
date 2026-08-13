import Avatar from "@/components/Avatar";
import ProductCards from "@/components/ProductCards";
import PromotionCards from "@/components/PromotionCards";
import WalletBalanceCard from "@/components/WalletBalanceCard";
import { appStyles, colors } from "@/constants";
import { useProductsCatalog } from "@/src/hooks/useProductsCatalog";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/authcontext";
import { useNotifications } from "../context/notificationcontext";
import { useWallet } from "../context/walletcontext";

export default function HomeScreen() {
   
    const router = useRouter();
    const { user, accesstoken } = useAuth();
    const { balance, isWalletLoading } = useWallet();
  
    const { unreadCount } = useNotifications();

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);



    const [displayName, setDisplayName] = useState("Hi, there");

    

    const { data: products = [], isLoading, error } = useProductsCatalog(accesstoken);
    const featuredProducts = useMemo(() => products.slice(0, 6), [products]);


    useEffect(() => {
        const fullName =
            user?.name?.trim() ||
            `${(user as any)?.firstname ?? ""} ${(user as any)?.lastname ?? ""}`.trim();

        setDisplayName(fullName ? `Hi, ${fullName}` : "Hi, there");

       
    }, [user]);

    
    return (
        <SafeAreaView style={appStyles.homeContainer} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={appStyles.homeHeaderWrap}>
                <View style={appStyles.avatarRow}>
                    <Avatar />

                    <View style={{ flex: 1 }}>
                        <Text style={appStyles.homeNameText}>{displayName}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>

                        

                        <TouchableOpacity onPress={() => router.push('/notifications')}>
                            <Ionicons name="notifications-outline" size={20} color="#000" />
                            {unreadCount > 0 && (
                                <View style={appStyles.notificationBadge}/>
                                    
                                
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/profile')}
                            accessibilityLabel="Help"
                            accessibilityHint="Open help and support options"
                            style={styles.helpIconButton}
                        >
                            <MaterialCommunityIcons name="headset" size={20} color="#0F172A" />
                            <View style={styles.helpBadge}>
                                <Text style={styles.helpBadgeText}>Help</Text>
                            </View>
                        </TouchableOpacity>
                        
                    </View>
                </View>
            </View>

            <FlatList
                data={[]}
                renderItem={null}
                ListHeaderComponent={
                    <>
                        <View style={appStyles.homeContent}>
                            <WalletBalanceCard
                                balance={balance}
                                isBalanceVisible={isBalanceVisible}
                                isWalletLoading={isWalletLoading}
                                onToggleBalanceVisible={() => setIsBalanceVisible(!isBalanceVisible)}
                                onPressTransactionHistory={() => router.push('/transaction-history')}
                                onPressTopUp={() => router.push('/wallet-topup')}
                            />

                            <View style={appStyles.homeActionRow}>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/products',
                                        params: { section: 'materials' }
                                    })}
                                    style={appStyles.homePrimaryActionButton}>
                                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                    <Text style={appStyles.homePrimaryActionText}>Order Materials</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/products',
                                        params: { section: 'truck' }
                                    })}
                                    style={appStyles.homeSecondaryActionButton}>
                                    <MaterialCommunityIcons name="truck-outline" size={18} color={colors.primary} />
                                    <Text style={appStyles.secondaryButtonText}>Order Truck Only</Text>
                                </TouchableOpacity>
                            </View>

                            <PromotionCards />
                        </View>

                        <View style={appStyles.homeProductSection}>
                            <Text style={appStyles.homeProductHeading}>Featured Products</Text>

                            {error ? (
                                <Text style={{ color: 'red', marginVertical: 10 }}>
                                    {(error as Error).message}
                                </Text>
                            ) : isLoading ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} />
                            ) : (
                                <ProductCards products={featuredProducts} />
                            )}

                            <TouchableOpacity
                                onPress={() => router.push('/products')}
                                activeOpacity={0.9}
                                style={appStyles.homeLoadMoreButton}
                            >
                                <Ionicons name="chevron-forward" size={16} color={colors.primary} style={appStyles.homeLoadMoreIcon} />
                                <Text style={appStyles.homeLoadMoreText}>Load More</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                showsHorizontalScrollIndicator={false}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    helpIconButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
       
        position: 'relative',
        overflow: 'visible',
    },
    helpBadge: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: '#0B4A8B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    helpBadgeText: {
        fontSize: 9,
        lineHeight: 12,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});



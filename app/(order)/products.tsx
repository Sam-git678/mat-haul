import ProductCards from "@/components/ProductCards";
import ProductsSkeleton from "@/components/ProductsSkeleton";
import SearchBox from "@/components/SearchBox";
import { appStyles, colors } from "@/constants";
import { useProductsCatalog } from "@/src/hooks/useProductsCatalog";
import { pullToRefresh } from '@/utils/helper';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";

import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";

const filters = [
  { key: "all", label: "All" },
  { key: "materials", label: "Materials" },
  { key: "truck", label: "Truck Services" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export default function ProductsScreen() {
  const router = useRouter();
  const { accesstoken } = useAuth();
  const { section } = useLocalSearchParams();
  const initialFilter = filters.some((f) => f.key === section) ? (section as FilterKey) : "all";
  const [activeFilter, setActiveFilter] = useState<FilterKey>(initialFilter);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);


  const { data: products = [], isLoading, error, refetch } = useProductsCatalog(accesstoken);
 
  
  
  
  const visibleProducts = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return products.filter((item) => {
      const matchesCategory = activeFilter === "all" || item.category === activeFilter;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.desc.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, products, search]);
 
  const onRefresh = useCallback(async () => {
      await pullToRefresh(setRefreshing, async () => {
        await refetch();
      });
    }, [refetch]);

  return (
    <SafeAreaView style={appStyles.containerWhite} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={appStyles.pageHeaderBetween}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={appStyles.circleIconButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Products & Services</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>
      
      <View style={appStyles.pageContent}>
        <Text style={appStyles.headerTitle}>Available Products & Services</Text>
        <Text style={appStyles.headerSubtitle}>Order construction materials and truck services</Text>
        
        <SearchBox placeholder="Search products" onSearch={setSearch} />
        <View style={appStyles.chipRow}>
        
          {filters.map((item) => {
            const isActive = activeFilter === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.9}
                onPress={() => setActiveFilter(item.key)}
                style={[appStyles.chip, isActive && appStyles.chipActive]}
              >
                <Text style={[appStyles.chipText, isActive && appStyles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

        </View>
       
        {error ? (
          <Text style={{ color: 'red', marginVertical: 10 }}>
            {(error as Error).message}
          </Text>
        ) : isLoading ? (
          <ProductsSkeleton count={6} />
        ) : (
          <ProductCards products={visibleProducts} refreshing={refreshing} onRefresh={onRefresh} />
        )}
      </View>
    
    </SafeAreaView>
  );
}

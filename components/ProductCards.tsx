import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import {
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


type ProductCategory = 'materials' | 'truck';

type ProductItem = {
  id: string;
  name: string;
  productImage?: any;
  desc: string;
  category: ProductCategory;
};

type ProductCardsProps = {
  products?: ProductItem[];
  refreshing?: boolean;
  onRefresh?: () => void;
};

type ProductCardItemProps = {
  item: ProductItem;
  onPress: (item: ProductItem) => void;
};

const ProductCardItem = memo(function ProductCardItem({ item, onPress }: ProductCardItemProps) {
  return (
    <View style={styles.productCard}>
      {item.productImage ? (
        <ImageBackground
          source={item.productImage}
          style={styles.productImagePlaceholder}
          imageStyle={styles.productImage}
        >
          <View style={styles.productDetails}>
            <View style={styles.productDetailsContent}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={styles.productDescription} numberOfLines={2}>
                {item.desc}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPress(item)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.orderNowWrap}
              >
                <Text style={styles.orderNowText}>Order now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.productImagePlaceholder, styles.productImageFallback]}>
          <View style={styles.productDetails}>
            <View style={styles.productDetailsContent}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={styles.productDescription} numberOfLines={2}>
                {item.desc}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPress(item)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.orderNowWrap}
              >
                <Text style={styles.orderNowText}>Order now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

function ProductCards({
  products = [],
  refreshing = false,
  onRefresh,
}: ProductCardsProps) {
  const router = useRouter();

  const handlePress = useCallback(
    (item: ProductItem) => {
      if (item.category === 'truck') {
        router.push({
          pathname: '/order-truck',
          params: {
            truckSize: item.name,
            vehicleTypeId: item.id,
          },
        });
      } else {
        router.push({
          pathname: '/order-material',
          params: {
            materialType: item.name,
            productId: item.id,
          },
        });
      }
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: ProductItem }) => <ProductCardItem item={item} onPress={handlePress} />,
    [handlePress]
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No products available.</Text>
      }
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      renderItem={renderItem}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={3}
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
     
    />
  );
}

export default memo(ProductCards);




const styles = StyleSheet.create({
    row: {
        justifyContent: 'space-between',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Forces the 3rd item to the next "row"
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%', // Ensures 2 columns with a small gap
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 16,
        overflow: 'hidden',
        
    },
    productImagePlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: '#F1F5F9',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    productImageFallback: {
        backgroundColor: '#E2E8F0',
    },
    productImage: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    
    productDetails: {
        marginHorizontal: 6,
        marginBottom: 6,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: 'rgba(58, 45, 34, 0.28)',
    },
    productDetailsContent: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 50,
        borderRadius: 17,
        backgroundColor: 'rgba(92, 77, 63, 0.34)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 2,
    },
    productDescription: {
        fontSize: 11,
        color: 'rgba(248, 250, 252, 0.74)',
        marginTop: 2,
        lineHeight: 14,
    },
    orderNowWrap: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    orderNowText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.90)',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0B4A8B',
        marginTop: 10,
    },
    emptyText: {
        width: '100%',
        textAlign: 'center',
        color: '#64748B',
        marginVertical: 12,
        fontSize: 14,
    },
})

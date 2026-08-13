// src/hooks/useProductsCatalog.ts
import { productApi, vehicleApi } from '@/src/config/api';
import { getPublicBaseUrl } from '@/utils/helper';
import { useQuery } from '@tanstack/react-query';
import { ImageSourcePropType } from 'react-native';


export type ProductCategory = 'materials' | 'truck';

export type CatalogProductItem = {
  id: string;
  name: string;
  productImage?: ImageSourcePropType;
  desc: string;
  category: ProductCategory;
};



const resolveImageUri = (uri: string | null | undefined): ImageSourcePropType | undefined => {
  const raw = String(uri ?? '').trim();
  if (!raw) {
    return undefined;
  }

  if (/^https?:\/\//i.test(raw)) {
    return { uri: raw };
  }

  const baseUrl = getPublicBaseUrl();
  if (raw.startsWith('/')) {
    return baseUrl ? { uri: `${baseUrl}${raw}` } : undefined;
  }

  return baseUrl ? { uri: `${baseUrl}/${raw}` } : undefined;
};

export const productsCatalogQueryKey = (accesstoken: string | null) =>
  ['products-catalog', accesstoken] as const;

export const fetchProductsCatalog = async (accesstoken: string | null) => {
  const [productResult, vehicleResult] = await Promise.all([
    productApi.getProducts(accesstoken),
    vehicleApi.getVehicleTypes(accesstoken),
  ]);

  if (!productResult.success && !vehicleResult.success) {
    throw new Error(productResult.message || vehicleResult.message || 'Failed to fetch products');
  }

  const materialProducts = productResult.success ? productResult.data.products : [];
  const vehicleTypes = vehicleResult.success ? vehicleResult.data.vehicletypes : [];

  

  const materialItems: CatalogProductItem[] = materialProducts.map((item: any) => ({
    id: String(item.id),
    name: String(item.name ?? ''),
    productImage: resolveImageUri(item.imageurl ?? item.image_url),
    desc: String(item.description ?? ''),
    category: 'materials',
  }));

  const vehicleItems: CatalogProductItem[] = vehicleTypes.map((item: any) => ({
    id: String(item.id),
    name: String(item.name ?? ''),
    productImage: resolveImageUri(item.imageurl ?? item.image_url),
    desc: String(item.description ?? 'Truck hire'),
    category: 'truck',
  }));

  

  

  return [...materialItems, ...vehicleItems];
};

export const useProductsCatalog = (accesstoken: string | null) =>
  useQuery<CatalogProductItem[]>({
    queryKey: productsCatalogQueryKey(accesstoken),
    queryFn: () => fetchProductsCatalog(accesstoken),
    enabled: !!accesstoken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

export type ProductRecord = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  category?: 'materials' | 'truck' | string | null;
};

export type ProductsData = {
  products: ProductRecord[];
  categories?: string[];
  total?: number;
};

export type MaterialOrderRequest = {
  orderType: "materials";
  materialType: string;
  pricingMode: "per_truck" | "per_ton";
  loadType?: "FULL_LOAD" | "ONE_BULK_BAG" | "HALF_BULK_BAG";
  unitcount?: number;
  quantityTons: number;
  deliveryAddress: string;
  deliveryContactPerson?: string;
  deliveryPhone?: string;
  deliveryContactPhone?: string;
  distancekm: string;
  distanceKm: string;
  scheduledDate?: string;
  scheduledTime?: string;
  deliveryNotes?: string;
};

export type TruckOrderRequest = {
  orderType: "vehicle_hire";
  truckCategory?: "tipper" | "lorry" | "flatbed" | "containercarrier" | "other";
  goodsType?: "building_materials" | "equipment" | "household_goods" | "commercial_goods" | "agricultural_goods" | "other";
  truckSize: string;
  Capacity?: string;
  numberOfTrucks: number;
  pickupLocation: string;
  pickupContactPerson?: string;
  pickupPhoneNumber?: string;
  pickupPhone?: string;
  pickupDate?: string;
  deliveryLocation: string;
  deliveryContactPerson?: string;
  deliveryPhone?: string;
  deliveryContactPhone?: string;
  distancekm: string;
  distanceKm: string;
  dispatchDate?: string;
  cargoDescription?: string;
  deliveryNotes?: string;
};


export type EstimatePayload = {
  draftId: string
  orderType: 'estimate';
  materialType?: string;
  deliveryAddress?: string;
  deliveryContactPerson?: string;
  deliveryPhone?: string;
  deliveryContactPhone?: string;
  loadType?: string;
  quantityTons?: number;
  scheduledDate?: string;
  deliveryNotes?: string;
  quarryid: string;
  pricingmode: "per_truck" | "per_ton";
  distancekm: string;
  distanceKm: string;
  unitcount?: number;
  

  items: {
    productid: string;
    quantitytons: number;
  }[];
  
};

export type OrderRequest = MaterialOrderRequest | TruckOrderRequest | EstimatePayload;


export type UiOrder = {
  id: string;
  title: string;
  location: string;
  amount: string;
  status: 'Draft' | 'Active' | 'Pending' | 'Completed' | 'Cancelled';
  rawStatus: string;
  rawPaymentStatus?: string;
  rawOrderType?: string;
  isOpenable: boolean;
};


export type RawOrder = {
  id?: string;
  ordernumber?: string;
  ordertype?: string;
  order_type?: string;
  createdat?: string;

  orderdate?: string;
  order_date?: string;
  materialtype?: string;
  material_type?: string;
  pickup_location?: string;
  pickupaddress?: string;
  deliverylocation?: string;
  delivery_address?: string;
  paymentstatus?: string;
  payment_summary?: {
    total?: number | string;
    material_cost?: number | string;
    delivery_cost?: number | string;
    service_cost?: number | string;
    amount_paid?: number | string;
    balance_due?: number | string;
    payment_status?: string;
  };
  expectedtotaltonnage?: number | string;
  items?: string;
  media?: unknown;
  truck_size?: string;
  truck_category?: string;
  goods_type?: string;
  unitcount?: number;
  number_of_trucks?: number;
  delivery_distance?: number | string;
  status_history?: string;
  productname?: string;
  product_name?: string;
  pricingmode?: string;
  pricing_mode?: string;
  cargodescription?: string;
  cargo_description?: string;
  notes?: string;
  quantitytons?: number | string;
  quantity_tons?: number | string;
  capacitytons?: number | string;
  distancekm?: number | string;
  distance_km?: number | string;
  materialcost?: number | string;
  material_cost?: number | string;
  deliverycost?: number | string;
  delivery_cost?: number | string;
  deliveryaddress?: string;
  dropoff_address?: string;
  pickup_address?: string;
  finalamount?: number | string;
  total_price?: number | string;
  estimated_amount?: number | string;
  estimatetotal?: number | string;
  actual_amount?: number | string;
  status?: string;
};

export type GetOrdersData = {
  data: RawOrder[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
};

export type OrderCreateData = {
  order: Record<string, unknown>;
};

export type TruckOrderCreateData = {
  order: Record<string, unknown>;
  pricing?: {
    distancekm?: number;
    baseprice?: number | string;
    distance_cost?: number | string;
    total_price?: number | string;
  };
  paymentstatus?: string;
  wallet_balance?: number | string;
};

export type OrderEstimate = {
  productid: string;
  product_name: string;
  quantitytons: number;
  price_per_ton?: number;
  loadtype?: string;
  unitcount?: number;
  unit_price?: number;
  subtotal: number;
};

export type MaterialOrderEstimate = {
  items: OrderEstimate[];
  totaltonnage: number;
  estimatetotal: number;
  currency: 'NGN' | string;
};


export type TruckOrderEstimate = {
  distancekm: number;
  baseprice: number;
  distance_cost: number;
  total_price: number;
  currency: 'NGN' | string;
};


export type OrderDetailsData = {
  order: Record<string, unknown>;
};

export type OrderCancelData = null;

type OrderPayData = {
  amount_paid: number;
  total_paid: number;
  balance_due: number;
  wallet_balance: number;
  paymentreference: string;
  paymentmethod: string;
  order_status: string;
  paymentstatus: string;
};


type AlatPayCheckout = {
  provided: string;
  script_url: string;
  api_key: string;
  business_id: string;
  business_name: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
}

export type AlatPayPaymentData = {
  reference: string;
  transaction_id: string;
  orderid: string;
  ordernumber: string;
  amount: number;
  method: string;
  status: string;
  paymentstatus: string;
  order_status: string;
  bank_details: string;
  checkout: AlatPayCheckout;
  message: string;
}

export type payOrderResponse = OrderPayData | AlatPayPaymentData

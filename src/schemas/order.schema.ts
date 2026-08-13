import { z } from 'zod';

export const orderMaterialSchema = z.object({
  orderType: z.literal('materials'),
  materialType: z.string().min(1, "Material type is required"),
  pricingMode: z.enum(['per_truck', 'per_ton'], { message: 'Pricing mode is required' }),
  loadType: z.enum(['FULL_LOAD', 'ONE_BULK_BAG', 'HALF_BULK_BAG']).optional(),
  quantityTons: z.coerce.number().gt(0, "Quantity must be greater than 0"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryContactPerson: z.string().min(2, 'delivery contact person is required'),
  deliveryPhone: z.string().min(10, 'delivery contact phone is required'),
  deliveryNotes: z.string().max(500).optional(),
  scheduledDate: z.string()
}).superRefine((data, ctx) => {
  if (data.pricingMode === 'per_truck' && !data.loadType?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['loadType'],
      message: 'Load type is required for per truck pricing',
    });
  }
});

export type OrderMaterialFormData = z.input<typeof orderMaterialSchema>;

export const orderTruckSchema = z.object({
  orderType: z.literal('vehicle_hire'),
  truckCategory: z.enum(['tipper', 'lorry', 'flatbed', 'containercarrier', 'other'], {
    message: 'Truck category is required',
  }),
  goodsType: z.enum([
    'building_materials',
    'equipment',
    'household_goods',
    'commercial_goods',
    'agricultural_goods',
    'other',
  ], {
    message: 'Type of goods is required',
  }),
  truckSize: z.string().min(1, 'Truck size is required'),
  numberOfTrucks: z.coerce.number().int().gt(0, 'Number of trucks must be greater than 0'),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  pickupContactPerson: z.string().min(2, 'pickup contact person is required'),
  pickupPhone: z.string().min(10, 'pickup contact phone is required'),
  pickupDate: z.string().optional(),
  deliveryLocation: z.string().min(1, 'Delivery location is required'),
  deliveryContactPerson: z.string().min(2, 'delivery contact person is required'),
  deliveryPhone: z.string().min(10, 'delivery contact phone is required'),
  dispatchDate: z.string(),
  cargoDescription: z.string().optional(),
  deliveryNotes: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  if (data.goodsType === 'other' && !data.cargoDescription?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cargoDescription'],
      message: 'Goods description is required when selecting Other goods.',
    });
  }
});

export type OrderTruckFormData = z.input<typeof orderTruckSchema>;

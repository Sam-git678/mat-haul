export type VehicleTypeItem = {
  id: string;
  name?: string;
  capacitytons?: number | string;
  baseprice?: number | string;
  perkm?: number | string;
  status?: string;
  [key: string]: unknown;
};

export type VehicleTypesData = {
  vehicletypes: VehicleTypeItem[];
  total: number;
};

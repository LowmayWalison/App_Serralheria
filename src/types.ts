export interface ItemRow {
  id: string;
  description: string;
  unitCost: number;
  quantity: number;
  unitLabel?: string;
}

export interface EnergyItem {
  id: string;
  description: string;
  powerKw: number;
  hours: number;
}

export interface ExtraCostItem {
  id: string;
  description: string;
  cost: number;
}

export interface WorkshopProfile {
  name: string;
  description?: string;
  phone: string;
  pixKey: string;
  city: string;
  warranty: string;
  logoUrl?: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'completed' | 'canceled';

export interface QuoteData {
  id: string;
  projectClient: string;
  clientPhone: string;
  date: string;
  validityDays: number;
  deliveryDays: string;
  location: string;
  observations: string;
  
  metalItems: ItemRow[];
  materialItems: ItemRow[];
  consumableItems: ItemRow[];
  discItems: ItemRow[];
  
  energyTariff: number; // R$ per kWh
  energyItems: EnergyItem[];
  
  toolItems: ItemRow[];
  laborItems: ItemRow[];
  extraCosts: ExtraCostItem[];
  
  profitMargin: number; // percentage, e.g. 35%
  cardFeePercent: number; // percentage, e.g. 4.5%
  cashDiscountPercent: number; // percentage, e.g. 5%
  
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatedTotals {
  subMetal: number;
  subMaterials: number;
  subConsumables: number;
  subDiscs: number;
  subEnergy: number;
  subTools: number;
  subLabor: number;
  subExtras: number;
  
  totalMaterials: number; // metal + materials + consumables + discs
  totalDirectCost: number; // all sub-totals combined
  
  profitAmount: number;
  finalPrice: number;
  
  cashDiscountAmount: number;
  cashPrice: number;
  
  entryPrice: number; // 50%
  remainingPrice: number; // 50%
  
  installmentCount: number;
  installmentAmount: number;
}

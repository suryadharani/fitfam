/**
 * FitFam Core Domain Types
 */

export type WeightUnit = 'kg' | 'lbs';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  defaultUnit: WeightUnit; // Default 'kg'
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string; // e.g. 'Me', 'Dad', 'Mom', 'Son', 'Daughter', 'Cousin', etc.
  scheduleDay: string; // e.g. 'Sunday'
  scheduleTime: string; // e.g. '08:00 AM'
  targetWeightKg?: number | null;
  createdAt: string;
}

export interface WeighInEntry {
  id: string;
  memberId: string;
  weightKg: number;
  date: string; // ISO String "YYYY-MM-DD"
  notes?: string | null;
  createdAt: string;
}

export interface ChartPoint {
  cx: number;
  cy: number;
  val: string;
}

export interface MemberInsight {
  name: string;
  currentWeight: string;
  wowChange: string;
  wowTrendClass: string;
  totalChange: string;
  totalTrendClass: string;
  historyWeeks: number;
  trendSummary: string;
  avgWeight: string;
  chartPoints: ChartPoint[];
  areaPath: string;
  linePath: string;
}

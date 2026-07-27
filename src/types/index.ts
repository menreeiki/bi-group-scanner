export type RiskLevel = 'high' | 'medium' | 'low';

export type DefectCategory =
  | 'structural'
  | 'surface'
  | 'geometric'
  | 'concrete'
  | 'finish'
  | 'plumbing'
  | 'electrical';

export interface DefectMetric {
  label: string;
  value: string;
  unit?: string;
}

export interface Defect {
  id: string;
  code: string;
  title: string;
  category: DefectCategory;
  risk: RiskLevel;
  regulation: string;
  description: string;
  consequence: string;
  metrics: DefectMetric[];
  recommendation: string;
  /** position on the AR viewfinder, percentages */
  x: number;
  y: number;
}

export interface BuildingBlock {
  id: string;
  name: string;
}

export interface Floor {
  id: string;
  name: string;
  number: number;
}

export interface Room {
  id: string;
  name: string;
  roomType: string;
}

export interface ConstructionObject {
  id: string;
  name: string;
  developer: string;
  city: string;
  address: string;
  status: 'active' | 'punch' | 'handed-over';
  /** real geo-coordinates [latitude, longitude] for Yandex Maps */
  coords: [number, number];
  /** district within the city */
  district: string;
  lastScanDate: string;
  unitsScanned: number;
  defectsOpen: number;
  hasSubstrate: boolean;
  substrateDate: string;
  blocks: BuildingBlock[];
  floors: Floor[];
  rooms: Room[];
}

export interface ScanReport {
  id: string;
  reportId: string;
  objectId: string;
  objectName: string;
  blockName: string | null;
  floorName: string | null;
  roomName: string | null;
  objectLabel: string;
  defectCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  topRegulation: string;
  status: 'draft' | 'issued' | 'resolved';
  capturedAt: string;
}

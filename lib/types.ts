// Tipos compartidos del dominio.

export type BinType = "glass" | "paper" | "cans" | "organic";

export type PickupStatus = "none" | "scheduled" | "collected";

export interface Child {
  id: number;
  name: string;
  avatar: string; // emoji
  grade: number;
  seal_count: number;
  created_at: string;
}

export interface Point {
  id: number;
  child_id: number | null; // null = punto de la escuela
  kind: "home" | "school";
  label: string;
  pickup_date: string | null; // YYYY-MM-DD
  pickup_status: PickupStatus;
}

export interface Bin {
  id: number;
  point_id: number;
  type: BinType;
  is_full: boolean;
  marked_at: string | null;
}

// Un punto con sus recipientes, tal como lo consumen las pantallas.
export interface PointWithBins extends Point {
  bins: Bin[];
}

export const BIN_TYPES: BinType[] = ["glass", "paper", "cans", "organic"];

// Etiquetas y colores para la UI (los usaremos en las pantallas).
export const BIN_META: Record<BinType, { label: string; emoji: string }> = {
  glass: { label: "Vidrio", emoji: "🟢" },
  paper: { label: "Papel/Cartón", emoji: "🔵" },
  cans: { label: "Latas/Plástico", emoji: "🟡" },
  organic: { label: "Foso (orgánicos)", emoji: "🟤" },
};

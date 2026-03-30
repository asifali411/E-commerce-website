import type { ItemCondition, ItemCategory, ReportCategory } from "./types";

export interface ItemCreate {
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  condition: ItemCondition;
  categories: ItemCategory[];
}

export interface ItemUpdate {
  title?: string | null;
  description?: string | null;
  min_price?: number | null;
  quantity?: number | null;
  condition?: ItemCondition | null;
  categories?: ItemCategory[] | null;
}

export interface BidCreate {
  price: number;
  quantity: number;
}

export interface BidUpdate {
  price?: number | null;
  quantity?: number | null;
}

export interface ReportCreate {
  category: ReportCategory;
  description?: string | null;
}
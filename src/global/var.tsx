import type { ItemCategory } from "./types";
import {
  Package,
  Monitor01,
  PencilLine,
  Car01,
  ShoppingCart02,
  WatchCircle
} from "./icons";

// ------ Variables ------------------------------------------------------
export let navExpanded = false;

export const CATEGORIES: Record<ItemCategory, React.ReactNode> = {
  All: <ShoppingCart02 size={12} />,
  Electronics: <Monitor01 size={12} />,
  Stationary: <PencilLine size={12} />,
  Rent: <Car01 size={12} />,
  Accessories: <WatchCircle size={12} />,
  Miscellaneous: <Package size={12} />,
};

// ------ Setters --------------------------------------------------------
export const setNavExpanded = (value: boolean): void => {
  navExpanded = value;
};

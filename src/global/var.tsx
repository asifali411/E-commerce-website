import type { ItemCategory } from "./types";
import {
  Package,
  Monitor01,
  PencilLine,
  Building07,
  Tag01
} from "@untitledui/icons";

// ------ Variables ------------------------------------------------------
export let navExpanded = false;

export const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  All: <Package size={12} />,
  Electronics: <Monitor01 size={12} />,
  Stationary: <PencilLine size={12} />,
  Rent: <Building07 size={12} />,
  Miscellaneous: <Package size={12} />,
  Accessories: <Tag01 size={12} />,
};

// ------ Setters --------------------------------------------------------
export const setNavExpanded = (value: boolean): void => {
  navExpanded = value;
};

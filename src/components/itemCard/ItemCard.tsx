// import { useState } from "react";
import {
  User01,
  Star01,
  Clock,
  Package,
  Monitor01,
  PencilLine,
  Building07,
  // Heart,
  Flag01,
} from "@untitledui/icons";
import styles from "./ItemCard.module.css";

// ── Types ──────────────────────────────────────────────────
export type ItemCategory =
  | "Electronics"
  | "Stationary"
  | "Rent"
  | "Miscellaneous";
export type ItemCondition = "New" | "Lightly Used" | "Heavily Used";

export interface Item {
  id: number;
  title: string;
  seller: string;
  sellerRating: number;
  minPrice: number;
  categories: ItemCategory[];
  condition: ItemCondition;
  bids: number;
  timeLeft?: string;
}

// ── Helpers ────────────────────────────────────────────────
const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  "Lightly Used": styles.conditionLight,
  "Heavily Used": styles.conditionHeavy,
};

const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  Electronics: <Monitor01 size={11} />,
  Stationary: <PencilLine size={11} />,
  Rent: <Building07 size={11} />,
  Miscellaneous: <Package size={11} />,
};

// ── Component ──────────────────────────────────────────────
export default function ItemCard({ item }: { item: Item }) {
  // const [saved, setSaved] = useState(false);

  return (
    <article className={styles.card}>
      {item.timeLeft && (
        <div className={styles.urgencyBadge}>
          <Clock size={12} />
          {item.timeLeft}
        </div>
      )}

      {/* Image area */}
      <div className={styles.cardImagePlaceholder}>
        <Package size={32} className={styles.cardImageIcon} />

        {/* Hover actions */}
        <div className={styles.cardActions}>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnReport}`}
            onClick={(e) => e.stopPropagation()}
            title="Report this listing"
          >
            <Flag01 size={15} />
          </button>

          {/* <button
            className={`${styles.actionBtn} ${saved ? styles.actionBtnSaved : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setSaved((s) => !s);
            }}
            title={saved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart size={15} />
          </button> */}
        </div>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <div className={styles.categoryWrapper}>
            {item.categories.map((cat) => (
              <span key={cat} className={styles.categoryTag}>
                {CATEGORY_ICON[cat]}
                {cat}
              </span>
            ))}
          </div>
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[item.condition]}`}
          >
            {item.condition}
          </span>
        </div>

        <h3 className={styles.cardTitle}>{item.title}</h3>

        <div className={styles.cardSeller}>
          <User01 size={11} />
          <span>{item.seller}</span>
          <Star01 size={11} className={styles.starIcon} />
          <span>{item.sellerRating.toFixed(1)}</span>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>
            ₹{item.minPrice.toLocaleString("en-IN")}
          </span>
          <span className={styles.cardBids}>
            {item.bids} {item.bids === 1 ? "bid" : "bids"}
          </span>
        </div>
      </div>
    </article>
  );
}

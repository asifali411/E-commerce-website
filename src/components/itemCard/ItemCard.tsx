import {
  User01,
  Star01,
  Package,
  Flag01,
} from "@untitledui/icons";
import styles from "./ItemCard.module.css";
import { useNavigate } from "react-router-dom";
import type { ItemCondition } from "../../global/types";
import type { ItemResponse } from "../../global/schema";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../toast/Toast";
import { CATEGORIES } from "../../global/var";

// ── Helpers ────────────────────────────────────────────────
const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  "Lightly_Used": styles.conditionLight,
  "Heavily_Used": styles.conditionHeavy,
};

// ── Component ──────────────────────────────────────────────
export default function ItemCard({ 
  item, 
  onReport, 
  onClick,
  hideHoverAction,
}: { 
  item: ItemResponse, 
  onReport: (id: number) => void, 
  onClick?: (id: number) => void,
  hideHoverAction?: boolean;
}) {

  const { addToast } = useToast();
  const { user } = useAuth();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleNavigation = () => {
    if(isAuthenticated){
      navigate(`items/${item.id}`);
    } else {
      addToast({
        type: "warning",
        title: "You are logged out",
        message: "Please Log in to continue",
        duration: 4000,
      });
    }

  }
 
  return (
    <article
      className={styles.card}
      onClick={
        onClick
          ? () => {
              onClick(item.id);
            }
          : handleNavigation
      }
    >
      {/* Image area */}

      <div className={styles.cardImagePlaceholder}>
        {item.images.length === 0 && (
          <Package size={32} className={styles.cardImageIcon} />
        )}
        {item.images.length > 0 && (
          <img
            src={`/api/${item.images[0].image_path}`}
            className={styles.cardImage}
          ></img>
        )}

        {/* Hover actions */}
        <div
          className={styles.cardActions}
          style={{
            visibility: `${item?.seller?.username === user?.username || hideHoverAction ? "hidden" : "visible"}`,
          }}
        >
          <button
            className={`${styles.actionBtn} ${styles.actionBtnReport}`}
            onClick={(e) => {
              e.stopPropagation();
              onReport(item.id);
            }}
            title="Report this listing"
          >
            <Flag01 size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <div className={styles.categoryWrapper}>
            {item.categories.map((cat) => (
              <span key={cat} className={styles.categoryTag}>
                {CATEGORIES[cat]}
                {cat}
              </span>
            ))}
          </div>
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[item.condition]}`}
          >
            {item.condition?.replaceAll("_", " ")}
          </span>
        </div>

        <h3 className={styles.cardTitle}>{item.title}</h3>

        <div className={styles.cardSeller}>
          <User01 size={11} />
          <span>{item.seller.username}</span>
          <Star01 size={11} className={styles.starIcon} />
          <span>{item.seller.rating.toFixed(1)}</span>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>
            ₹{item.min_price.toLocaleString("en-IN")}
          </span>

          <span className={styles.cardBids}>
            {item.bid_count} {item.bid_count === 1 ? "bid" : "bids"}
          </span>
        </div>
      </div>
    </article>
  );
}

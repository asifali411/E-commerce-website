import {
  User01,
  Star01,
  Clock,
  Package,
  Monitor01,
  PencilLine,
  Building07,
  Flag01,
} from "@untitledui/icons";
import styles from "./ItemCard.module.css";
import { useNavigate } from "react-router-dom";
import type { ItemCategory, ItemCondition } from "../../global/types";
import type { ItemResponse } from "../../global/schema";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../toast/Toast";

// ── Place holders ────────────────────────────────────────────────
// let timeLeft = `${Math.floor(Math.random() * 10 + 2)} days left`;
let timeLeft; 

// ── Helpers ────────────────────────────────────────────────
const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  "Lightly_Used": styles.conditionLight,
  "Heavily_Used": styles.conditionHeavy,
};

const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  All: <Package size={11} />,
  Electronics: <Monitor01 size={11} />,
  Stationary: <PencilLine size={11} />,
  Rent: <Building07 size={11} />,
  Miscellaneous: <Package size={11} />,
};

// ── Component ──────────────────────────────────────────────
export default function ItemCard({ item }: { item: ItemResponse }) {

  const { addToast } = useToast();

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
      onClick={() => {
        handleNavigation();
      }}
    >
      {/* TODO: fix this, currently using placeholders */}
      {timeLeft && (
        <div className={styles.urgencyBadge}>
          <Clock size={12} />
          {timeLeft}
        </div>
      )}

      {/* Image area */}

      <div className={styles.cardImagePlaceholder}>
        {item.images.length === 0 && (
          <Package size={32} className={styles.cardImageIcon} />
        )}
        {item.images.length > 0 && (
          <img src={`/api/${item.images[0].image_path}`} className={styles.cardImage}></img>
        )}

        {/* Hover actions */}
        <div className={styles.cardActions}>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnReport}`}
            onClick={(e) => e.stopPropagation()}
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

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
import type { ItemCategory, ItemCondition, Item } from "../../global/types";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../toast/Toast";

// ── Place holders ────────────────────────────────────────────────
let timeLeft = `${Math.floor(Math.random() * 10 + 1)} days`;
let bids = Math.floor(Math.random() * 10);

// ── Helpers ────────────────────────────────────────────────
const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  "Lightly_Used": styles.conditionLight,
  "Heavily_Used": styles.conditionHeavy,
};

const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  Electronics: <Monitor01 size={11} />,
  Stationary: <PencilLine size={11} />,
  Rent: <Building07 size={11} />,
  Misseleneous: <Package size={11} />,
};

// ── Component ──────────────────────────────────────────────
export default function ItemCard({ item }: { item: Item }) {

  const { addToast } = useToast();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleNavigation = () => {
    if(isAuthenticated){
      navigate(`items/${item.id}`);
    }

    addToast({
      type: "warning",
      title: "Authentication error",
      message: "Log in to continue",
      duration: 3000,
    });
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

          {/* TODO: fix this, currently using placeholders */}
          <span className={styles.cardBids}>
            {bids} {bids === 1 ? "bid" : "bids"}
          </span>
        </div>
      </div>
    </article>
  );
}

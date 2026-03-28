import styles from "./ItemCard.module.css";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthProvider";

interface ItemCardProps {
  id: number;
  title: string;
  description: string;
  price: number;
  seller: string;
  primary_image: string;
  images?: string[];
  status?: string;
  timeLeft: string;
}

const PLACEHOLDER =
  "https://placehold.co/600x400/1a1a2e/818CF8?text=No+Image";

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  description,
  price,
  seller,
  primary_image,
  status = "ACTIVE",
  timeLeft,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const isSold = status === "SOLD";

  return (
    <article className={`${styles.card} ${isSold ? styles.cardSold : ""}`}>
      {/* ── Image ── */}
      <div className={styles.imageWrap}>
        <img
          src={primary_image || PLACEHOLDER}
          alt={title}
          className={styles.image}
          onError={(e) =>
            ((e.target as HTMLImageElement).src = PLACEHOLDER)
          }
        />

        {/* Status badge */}
        <span
          className={`${styles.statusBadge} ${
            isSold ? styles.sold : styles.active
          }`}
        >
          {status}
        </span>

        {/* Seller pill — overlaps image bottom */}
        <div className={styles.sellerPill}>@{seller}</div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        {/* Meta row */}
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Starting price</span>
            <span className={styles.metaValue}>
              ₹{price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className={styles.metaDivider} />

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Time left</span>
            <span className={`${styles.metaValue} ${styles.timeValue}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          className={styles.bidBtn}
          disabled={!isAuthenticated || isSold}
          onClick={() => navigate(`/items/${id}`)}
        >
          <span>{isSold ? "Sold" : "See Details"}</span>
          {!isSold && <ArrowRight size={16} strokeWidth={2.5} />}
        </button>
      </div>
    </article>
  );
};

export default ItemCard;
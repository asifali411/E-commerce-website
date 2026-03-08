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

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  description,
  price,
  seller,
  primary_image,
  images = [],
  status,
  timeLeft,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const hasImages = images.length > 0;
  hasImages;

  if (!status) {
    console.error("Status not found");
  }

  return (
    <div className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img src={primary_image} alt={title} />

        <button className={styles.menuBtn}>⋮</button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.seller}>@{seller}</div>

        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>

        <div className={styles.meta}>
          <div>
            <span className={styles.label}>Starting Price</span>
            <div className={styles.price}>₹ {price}</div>
          </div>

          <div>
            <span className={styles.label}>Time Left</span>
            <div className={styles.time}>{timeLeft}</div>
          </div>
        </div>

        <button
          className={styles.bidBtn}
          disabled={!isAuthenticated}
          onClick={() => navigate(`/items/${id}`)}
        >
          See Details
          <ArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
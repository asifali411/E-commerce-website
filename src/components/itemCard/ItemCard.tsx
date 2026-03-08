import styles from "./ItemCard.module.css";
import { useState, useEffect } from "react";

import { useAuth } from "../../Context/AuthProvider";

interface ItemCardProps {
  title: string;
  description: string;
  price: number;
  seller: string;
  primary_image: string;
  images?: string[];
  status: string;
  timeLeft: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
    title,
    description,
    price,
    seller,
    primary_image,
    images = [],
    status,
    timeLeft
}) => {

    const { isAuthenticated, fetchAllItems } = useAuth();
    const [bidBtnState, setBidBtnState] = useState(!isAuthenticated);

    useEffect(() =>{
        setBidBtnState(!isAuthenticated);
    }    
    ,[isAuthenticated])

    // Use images to avoid TypeScript error
    const hasImages = images.length > 0;
    if (!hasImages) console.error("No images found");

    //TODO: below code is a placeholder. remove it once we add status handling.
    if (!status) console.error("Status not found");

    return (
        <div className={styles.card}>
            {/* Image */}
            <div className={styles.imageWrapper}>
                <img src={primary_image} />

                <button className={styles.menuBtn}>
                    ⋮
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.seller}>@{seller}</div>

                <div className={styles.title}>{title}</div>
                <div className={styles.description}>{description}</div>

                <div className={styles.meta}>
                    <div>
                        <span className={styles.label}>Starting Price</span>
                        <div className={styles.price}>&#8377; {price} </div>
                    </div>

                    <div>
                        <span className={styles.label}>Time Left</span>
                        <div className={styles.time}>{timeLeft}</div>
                    </div>
                </div>

                <button 
                className={styles.bidBtn} 
                disabled={bidBtnState}
                // for debugging
                onClick={async () => {
                    const response = await fetchAllItems();
                    console.log(response);
                }}
                >Place Bid</button>
            </div>
        </div>
    );
};

export default ItemCard;
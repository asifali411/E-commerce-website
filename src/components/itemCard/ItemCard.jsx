import styles from "./ItemCard.module.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthProvider";

const ItemCard = ({
    title,
    description,
    price,
    seller,
    images = [],
    timeLeft
}) => {
    const [hovered, setHovered] = useState(false);

    const mainImage = images[0];
    const hoverImage = images[1] ?? images[0];

    const { isAuthenticated } = useAuth();
    const [bidBtnState, setBidBtnState] = useState(!isAuthenticated);

    useEffect(() =>{
        setBidBtnState(!isAuthenticated);
    }    
    ,[isAuthenticated])

    return (
        <div
            className={styles.card}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <div className={styles.imageWrapper}>
                <img
                    src={hovered ? hoverImage : mainImage}
                />

                <button className={styles.menuBtn}>
                    ⋮
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* <div className={styles.seller}>@{seller}</div> */}

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

                <button className={styles.bidBtn} disabled={bidBtnState}>Place Bid</button>
            </div>
        </div>
    );
};

export default ItemCard;
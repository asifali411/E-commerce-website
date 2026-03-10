import styles from './ItemDetails.module.css';
import Top from '../../components/top/Top';
import NavBar from '../../components/nav/NavBar';
import { Share2, Heart, UserCircle2, ChevronRight } from "lucide-react";
import { useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import { useEffect, useState } from 'react';
import { Star, StarFull, StarHalf } from './Stars';

enum ItemStatus {
    ACTIVE = "ACTIVE",
    SOLD = "SOLD"
}

enum BidStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

interface Bid {
    id: number;
    bid_price: number;
    username: string;
    rating: number;
    status: BidStatus;
    bider_id: number;
}

interface ItemProps {
    id: number;
    seller_id: number;
    seller_rating: number;
    username: string;
    title: string;
    description: string;
    price: number;
    primary_image: string;
    images: string[];
    status: ItemStatus;
    bids: Bid[];
}

const ItemDetails = () => {

    const { itemId } = useParams<{ itemId: string }>();
    const { fetchItem } = useAuth();

    const [item, setItem] = useState<ItemProps | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [selectedImage, setSelectedImage] = useState<string>("");
    const [highestBid, setHighestBid] = useState<number>(0);

    useEffect(() => {

        const loadItem = async () => {

            if (!itemId) {
                setLoading(false);
                return;
            }

            try {
                const data: ItemProps = await fetchItem(Number(itemId));

                setItem(data);

                const highest = Math.max(
                    data.price,
                    ...data.bids.map((bid: Bid) => bid.bid_price)
                );

                setHighestBid(highest);

                setSelectedImage(data.primary_image);

            } catch (error) {
                console.error("Failed to fetch item", error);
            } finally {
                setLoading(false);
            }
        };

        loadItem();

    }, [itemId, fetchItem]);

    const handlePreviewImgClicking = (imgUrl: string) => {
        setSelectedImage(imgUrl);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!item) {
        return <div>Item not found</div>;
    }

    return (
        <div className={styles.container}>

            <Top />

            <main>

                <div className={styles.wrapper}>

                    <div className={styles.left}>

                        <figure>
                            <img src={selectedImage} alt={item.title} />
                        </figure>

                        <div className={styles.previewPanel}>
                            <img
                                key={0}
                                src={item.primary_image}
                                alt="preview-0"
                                onClick={() => handlePreviewImgClicking(item.primary_image)}
                            />

                            {item.images && item.images.map((img, index) => (
                                <img
                                    key={index + 1}
                                    src={img}
                                    alt={`preview-${index + 1}`}
                                    onClick={() => handlePreviewImgClicking(img)}
                                />
                            ))}
                        </div>

                    </div>

                    <div className={styles.right}>

                        <div className={`${styles.pricePanel} ${styles.roundedCard}`}>

                            <div className={styles.top}>
                                <div className={styles.title}>{item.title}</div>

                                <div className={styles.icons}>
                                    <button className={styles.share}>
                                        <Share2 />
                                    </button>

                                    <button className={styles.addToWishlist}>
                                        <Heart />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.startingPrice}>

                                <div className={styles.bidDetails}>

                                    <div className={styles.startingBidSection}>
                                        <p>Starting Bid</p>
                                        <h3>
                                            &#8377;<span className={styles.startingBid}>{item.price}</span>
                                        </h3>
                                    </div>

                                    <div className={styles.seperator}></div>

                                    <div className={styles.highestBidSection}>
                                        <p>Highest Bid</p>
                                        <h3>
                                            &#8377;<span className={styles.highestBid}>{highestBid}</span>
                                        </h3>
                                    </div>

                                </div>

                                <button>Place Bid</button>

                            </div>

                        </div>

                        <div className={`${styles.roundedCard} ${styles.userDetails}`}>

                            <p>Sold by</p>

                            <h4>
                                <UserCircle2 />
                                {item.username}
                                <ChevronRight />
                            </h4>

                            <div className={styles.rating}>
                                {[...Array(5)].map((_, i) => {
                                    const rating = item.seller_rating;
                                    const isFull = i < Math.floor(rating);
                                    const isHalf = i === Math.floor(rating) && rating % 1 !== 0;

                                    return (
                                        <span key={i} className={styles.star}>
                                            {isFull ? <StarFull /> : isHalf ? <StarHalf /> : <Star />}
                                        </span>
                                    );
                                })}
                            </div>

                        </div>

                    </div>

                </div>

                <div className={styles.description}>
                    <p>{item.description}</p>
                </div>

            </main>

            <NavBar />

        </div>
    );
};

export default ItemDetails;
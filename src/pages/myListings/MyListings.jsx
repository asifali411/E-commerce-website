import styles from './MyListings.module.css';
import NavBar from '../../components/nav/NavBar';
import Top from '../../components/top/Top';
import ItemCard from '../../components/itemCard/ItemCard';
import SkeletonLoader from '../../components/skeletonLoader/SkeletonLoader';
import { useState, useEffect} from 'react';
import { useAuth } from '../../Context/AuthProvider';

const MyListings = () => {
    const [items, setItems] = useState([]);
    const [isLoadingItems, setIsLoadingItems] = useState(true);
    const { fetchUserItems } = useAuth();
    
        useEffect(() => {
            const loadItems = async () => {
                try {
                    const data = await fetchUserItems();
                    setItems(data);
                } catch (error) {
                    // console.error(error);
                } finally {
                    setIsLoadingItems(false);
                }
            };
    
            loadItems();
        }, []);

    return (
        <div className={styles.container}>
            <Top></Top>

            <main>
                {isLoadingItems && <SkeletonLoader />}

                {!isLoadingItems && items.map((item, index) => (
                    <ItemCard
                        key={index}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        seller={item.username}
                        timeLeft="2 days" // fix later
                        primary_image={item.primary_image}
                        images={item.images}
                        status={item.status}

                    />
                ))}

                {!isLoadingItems && items.length === 0 &&
                    <div className={styles.noItemsContainer}>
                        <p>No items found</p>
                    </div>
                }

            </main>

            <NavBar></NavBar>
        </div>
    );
};

export default MyListings;
import styles from './MyListings.module.css';
import NavBar from '../../components/nav/NavBar';
import Top from '../../components/top/Top';
import ItemCard from '../../components/itemCard/ItemCard';
import SkeletonLoader from '../../components/skeletonLoader/SkeletonLoader';

const MyListings = () => {
    return (
        <div className={styles.container}>
            <Top></Top>

            <main>
                <ItemCard 
                    title="random bullshit"
                    description="I stoled it."
                    price="470"
                    seller="vishy"
                    timeLeft="2 days"
                />

                {/* <SkeletonLoader></SkeletonLoader> */}
            </main>

            <NavBar></NavBar>
        </div>
    );
};

export default MyListings;
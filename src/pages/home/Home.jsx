import styles from './Home.module.css';
import NavBar from '../../components/nav/NavBar';
import Top from '../../components/top/Top';
import ItemCard from '../../components/itemCard/ItemCard';
import SkeletonLoader from '../../components/skeletonLoader/SkeletonLoader';

const Home = () => {
    return (
        <div className={styles.container}>
            <Top></Top>

            <main>
                <SkeletonLoader></SkeletonLoader>
                {/* <ItemCard></ItemCard> */}
            </main>

            <NavBar></NavBar>   
        </div>
    );
};

export default Home;
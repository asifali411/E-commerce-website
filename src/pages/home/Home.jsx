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
                <ItemCard 
                    title="random bullshit"
                    description="I stoled it."
                    price="470"
                    seller="vishy"
                    timeLeft="2 days"
                />
            </main>

            <NavBar></NavBar>   
        </div>
    );
};

export default Home;
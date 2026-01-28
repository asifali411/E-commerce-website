import styles from './Home.module.css';
import NavBar from '../../components/nav/NavBar';
import Top from '../../components/top/Top';
import ItemCard from '../../components/itemCard/ItemCard';

const Home = () => {
    return (
        <div className={styles.container}>
            <Top></Top>

            <main>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
                <ItemCard></ItemCard>
            </main>

            <NavBar></NavBar>   
        </div>
    );
};

export default Home;
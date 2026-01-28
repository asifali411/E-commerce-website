import styles from './Home.module.css';
import NavBar from '../nav/NavBar';
import Top from '../top/Top';

const Home = () => {
    return (
        <div className={styles.container}>
            <Top></Top>

            <NavBar></NavBar>
        </div>
    );
};

export default Home;
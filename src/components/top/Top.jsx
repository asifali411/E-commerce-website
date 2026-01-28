import styles from './Top.module.css';
import { Search, CircleUserRound } from 'lucide-react';

const Top = () => {
    return (
        <form className={styles.container}>
            <h1>Lorem ipsum.</h1>
            <div className={styles.profile}>
                <span>Profile Name</span>
                <CircleUserRound size={'2rem'}/>
            </div>
        </form>
    );
};

export default Top;
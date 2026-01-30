import styles from './Top.module.css';
import { CircleUserRound } from 'lucide-react';

const Top = () => {
    return (
        <form className={styles.container}>
            <h1>Lorem ipsum.</h1>
            <div className={styles.profile}>
                <span>Profile Name</span>
                <CircleUserRound size={'2rem'}/>
            </div>

            <div className={styles.register}>
                <button className={styles.secondary}>Login</button>
                <button className={styles.primary}>Sign up</button>
            </div>
        </form>
    );
};

export default Top;
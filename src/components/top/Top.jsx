import styles from './Top.module.css';
import { CircleUserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const Top = () => {
    return (
        <form className={styles.container}>
            <h1>Lorem ipsum.</h1>
            <div className={styles.profile}>
                <span>Profile Name</span>
                <CircleUserRound size={'2rem'}/>
            </div>

            <div className={styles.register}>
                <button className={styles.secondary}>
                    <Link to="/login">
                        Login
                    </Link>
                </button>
                <button className={styles.primary}>
                    <Link to="/register">
                        Sign up
                    </Link>
                </button>
            </div>
        </form>
    );
};

export default Top;
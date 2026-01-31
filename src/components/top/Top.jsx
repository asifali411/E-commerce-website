import styles from './Top.module.css';
import { CircleUserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Top = () => {

    const navigation = useNavigate();

    return (
        <form className={styles.container}>
            <h1>Lorem ipsum.</h1>
            <div className={styles.profile}>
                <span>Profile Name</span>
                <CircleUserRound size={'2rem'}/>
            </div>

            <div className={styles.register}>
                <button 
                className={styles.secondary}
                onClick={() => {navigation("/login")}}
                >
                    Login
                </button>
                <button 
                className={styles.primary}
                onClick={() => { navigation("/register") }}
                >
                    Sign up
                </button>
            </div>
        </form>
    );
};

export default Top;
import styles from './Top.module.css';
import { CircleUserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';

const Top = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    return (
        <div className={styles.container}>
            <h1>Lorem ipsum.</h1>

            {isAuthenticated && (
                <div className={styles.profile}>
                    <span>{user || 'Profile'}</span>
                    <CircleUserRound size="2rem" />
                </div>
            )}

            {!isAuthenticated && (
                <div className={styles.register}>
                    <button
                        type="button"
                        className={styles.secondary}
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        className={styles.primary}
                        onClick={() => navigate('/register')}
                    >
                        Sign up
                    </button>
                </div>
            )}
        </div>
    );
};

export default Top;
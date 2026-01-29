import styles from './Login.module.css';
import googleLogo from '../../assets/google.webp';
import mountain from '../../assets/mountain.jpg';

const Login = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: handle login
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.left}>
                    <img
                        
                        src={mountain}
                        alt="Login illustration"
                    />
                </div>

                <div className={styles.right}>
                    <header className={styles.header}>
                        <h1>Welcome back!</h1>
                        <p>See what's going on with your account</p>
                    </header>


                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>

                        <div className={styles.forgot}>
                            <a href="#">Forgot password?</a>
                        </div>

                        <button type="submit" className={styles.primaryBtn}>
                            Login
                        </button>

                        <div className={styles.signUP}>
                            <a>new here? sign up.</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

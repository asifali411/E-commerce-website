import { useState } from 'react';
import styles from './SignUP.module.css';
import { Link } from 'react-router-dom';
import mountain from '../../assets/mountain.jpg';

const SignUP = () => {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        contactNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const goNext = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            return;
        }

        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.username || !formData.contactNumber) return;

        // TODO: send formData to backend
        console.log('Signup data:', formData);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.left}>

                    <header className={styles.header}>
                        <h1>Create an account</h1>
                        <p>Step {step} of 2</p>
                    </header>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {step === 1 && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="confirmPassword">
                                        Confirm password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="button"
                                    className={styles.primaryBtn}
                                    onClick={goNext}
                                >
                                    Next
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="username">Username</label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="contactNumber">
                                        Contact number
                                    </label>
                                    <input
                                        id="contactNumber"
                                        name="contactNumber"
                                        type="tel"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className={styles.googleBtn}
                                    >
                                        Back
                                    </button>

                                    <button
                                        type="submit"
                                        className={styles.primaryBtn}
                                    >
                                        Create account
                                    </button>
                                </div>
                            </>
                        )}

                        <div className={styles.signUP}>
                            <Link to="/login">Already have an account? Log in.</Link>
                        </div>
                    </form>
                </div>

                <div className={styles.right}>
                    <img src={mountain} alt="Signup illustration" />
                </div>
            </div>
        </div>
    );
};

export default SignUP;
import { useState } from 'react';
import styles from './Login.module.css';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import mountain from '../../assets/mountain.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import axios from 'axios';

const Login = () => {

    //regex
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    
    const [showPassword, setShowPassword] = useState(false);
    const [showLoginLoading, setShowLoginLoading] = useState(false);

    const navigation = useNavigate();
    const { confirmLogin } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        username: '',
        password: '',
    });

    const [errorStates, setErrorStates] = useState({
        username: false,
        password: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Real-time validation if field had an error
        if (errorStates[name]) {
            validateField(name, value);
        }
    };

    const validateField = (fieldName, value) => {
        const newErrors = { ...errors };
        const newErrorStates = { ...errorStates };

        switch (fieldName) {
            case 'username':
                if (!value.trim()) {
                    newErrors.username = 'Username is required';
                    newErrorStates.username = true;
                } else {
                    newErrors.username = '';
                    newErrorStates.username = false;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                    newErrorStates.password = true;
                } else {
                    newErrors.password = '';
                    newErrorStates.password = false;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        setErrorStates(newErrorStates);
    };

    const validateForm = () => {
        const newErrors = {};
        const newErrorStates = {};
        let hasErrors = false;

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
            newErrorStates.username = true;
            hasErrors = true;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            newErrorStates.password = true;
            hasErrors = true;
        }

        setErrors(newErrors);
        setErrorStates(newErrorStates);

        return !hasErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setShowLoginLoading(true);

        try{
            const formURL = new URLSearchParams();

            formURL.append("username", formData.username);
            formURL.append("password", formData.password);
            formURL.append("grant_type", "password");
            formURL.append("scope", "");
            formURL.append("client_id", "");
            formURL.append("client_secret", "");

            const response = await axios.post("/api/login", formURL, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            if(response.status === 200){
                confirmLogin(formData.username);
                navigation('/');
            }

        }catch(err){
            console.log(err);
        } finally {
            setShowLoginLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.left}>
                    <img src={mountain} alt="Login illustration" />
                </div>

                <div className={styles.right}>
                    <header className={styles.header}>
                        <h1>Welcome back!</h1>
                        <p>See what's going on with your account</p>
                    </header>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div
                            className={`${styles.inputGroup} ${errorStates.username ? styles.errorGroup : ''
                                }`}
                        >
                            <label htmlFor="username">
                                Username
                                <p>{errors.username}</p>
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div
                            className={`${styles.inputGroup} ${errorStates.password ? styles.errorGroup : ''
                                }`}
                        >
                            <label htmlFor="password">
                                Password
                                <p>{errors.password}</p>
                            </label>
                            <div className={styles.passwordInputWrapper}>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className={styles.toggleBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className={styles.forgot}>
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        <button type="submit" className={styles.primaryBtn}>
                            { showLoginLoading && ( <LoaderCircle size={'1.5rem'} /> )}
                            Login
                        </button>

                        <div className={styles.signUP}>
                            <Link to="/register">New here? Sign up.</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
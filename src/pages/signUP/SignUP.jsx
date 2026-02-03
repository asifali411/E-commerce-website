import { useState } from 'react';
import styles from './SignUP.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import mountain from '../../assets/mountain.jpg';
import axios from 'axios';
import { useAuth } from '../../Context/AuthProvider'; 

const SignUp = () => {
    // Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gectcr\.ac\.in$/i;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    const contactNumberRegex = /^\d{10}$/;

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigation = useNavigate();
    const { confirmLogin } = useAuth();

    const [signUPLoading, setSignUPLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        contactNumber: '',
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        contactNumber: '',
    });

    const [errorStates, setErrorStates] = useState({
        email: false,
        password: false,
        confirmPassword: false,
        username: false,
        contactNumber: false,
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
            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                    newErrorStates.email = true;
                } else if (!emailRegex.test(value)) {
                    newErrors.email = 'Must be a valid college email';
                    newErrorStates.email = true;
                } else {
                    newErrors.email = '';
                    newErrorStates.email = false;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                    newErrorStates.password = true;
                } else if (!passwordRegex.test(value)) {
                    newErrors.password =
                        'Minimum 8 characters, include letters, numbers & symbols';
                    newErrorStates.password = true;
                } else {
                    newErrors.password = '';
                    newErrorStates.password = false;
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Confirm your password';
                    newErrorStates.confirmPassword = true;
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = 'Passwords do not match';
                    newErrorStates.confirmPassword = true;
                } else {
                    newErrors.confirmPassword = '';
                    newErrorStates.confirmPassword = false;
                }
                break;

            case 'username':
                if (!value.trim()) {
                    newErrors.username = 'Username is required';
                    newErrorStates.username = true;
                } else {
                    newErrors.username = '';
                    newErrorStates.username = false;
                }
                break;

            case 'contactNumber':
                if (!value.trim()) {
                    newErrors.contactNumber = 'Contact number is required';
                    newErrorStates.contactNumber = true;
                } else if (!contactNumberRegex.test(value)) {
                    newErrors.contactNumber = 'Enter a valid 10-digit number';
                    newErrorStates.contactNumber = true;
                } else {
                    newErrors.contactNumber = '';
                    newErrorStates.contactNumber = false;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        setErrorStates(newErrorStates);
    };

    const validateStepOne = () => {
        const newErrors = {};
        const newErrorStates = {};
        let hasErrors = false;

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            newErrorStates.email = true;
            hasErrors = true;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Must be a valid college email';
            newErrorStates.email = true;
            hasErrors = true;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            newErrorStates.password = true;
            hasErrors = true;
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password =
                'Minimum 8 characters, include letters, numbers & symbols';
            newErrorStates.password = true;
            hasErrors = true;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm your password';
            newErrorStates.confirmPassword = true;
            hasErrors = true;
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
            newErrorStates.confirmPassword = true;
            hasErrors = true;
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        setErrorStates((prev) => ({ ...prev, ...newErrorStates }));

        return !hasErrors;
    };

    const validateStepTwo = () => {
        const newErrors = {};
        const newErrorStates = {};
        let hasErrors = false;

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
            newErrorStates.username = true;
            hasErrors = true;
        } else if (formData.username.length <= 3) {
            newErrors.username = 'Username must be atleast 3 characters long';
            newErrorStates.username = true;
            hasErrors = true;
        } else if (formData.username.length > 20) {
            newErrors.username = 'Username cannot be more than 20 characters long';
            newErrorStates.username = true;
            hasErrors = true;
        } else if (formData.username.includes(" ")){
            newErrors.username = 'Usename cannot contain spaces';
            newErrorStates.username = true;
            hasErrors = true;
        }

        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
            newErrorStates.contactNumber = true;
            hasErrors = true;
        } else if (!contactNumberRegex.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Enter a valid 10-digit number';
            newErrorStates.contactNumber = true;
            hasErrors = true;
        } else if (String(+formData.contactNumber).length !== 10) {
            newErrors.contactNumber = 'Enter a valid 10-digit number';
            newErrorStates.contactNumber = true;
            hasErrors = true;
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        setErrorStates((prev) => ({ ...prev, ...newErrorStates }));

        return !hasErrors;
    };

    const goNext = () => {
        if (validateStepOne()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSignUPLoading(true);

        if (!validateStepTwo()) {
            setSignUPLoading(false);
            return;
        }

        const payload = {
            username: formData.username,
            email: formData.email,
            phone_no: `${formData.contactNumber}`,
            password: formData.password,
            confirm_password: formData.confirmPassword
        };

        try {
            const response = await axios.post("/api/register", payload);

            if(response.status === 200){
                confirmLogin(formData.username);
                navigation('/');
            }

            console.log(response);
        } catch (err) {
            console.log('Status:', err.response?.status);
            console.log('Data:', err.response?.data);
            console.log('Headers:', err.response?.headers);

            if(err.status === 400){
                setErrorStates({ ...errorStates, username: true, email: true, contactNumber: true });
                setErrors({
                    ...errors,
                    username: "Username, email or contact number already in use",
                    email: "Username, email or contact number already in use",
                    contactNumber: "Username, email or contact number already in use"
                });
            }
        } finally {
            setSignUPLoading(false);
        }
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
                                <div className={`${styles.inputGroup} ${errorStates.email ? styles.errorGroup : ''}`}>
                                    <label htmlFor="email">
                                        Email
                                        <p>{errors.email}</p>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={`${styles.inputGroup} ${errorStates.password ? styles.errorGroup : ''}`}>
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

                                <div className={`${styles.inputGroup} ${errorStates.confirmPassword ? styles.errorGroup : ''}`}>
                                    <label htmlFor="confirmPassword">
                                        Confirm Password
                                        <p>{errors.confirmPassword}</p>
                                    </label>
                                    <div className={styles.passwordInputWrapper}>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className={styles.toggleBtn}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label="Toggle confirm password visibility"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
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
                                <div className={`${styles.inputGroup} ${errorStates.username ? styles.errorGroup : ''}`}>
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

                                <div className={`${styles.inputGroup} ${errorStates.contactNumber ? styles.errorGroup : ''}`}>
                                    <label htmlFor="contactNumber">
                                        Contact Number
                                        <p>{errors.contactNumber}</p>
                                    </label>
                                    <input
                                        id="contactNumber"
                                        name="contactNumber"
                                        type="tel"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        className={styles.googleBtn}
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>

                                    <button type="submit" className={styles.primaryBtn}>
                                        { signUPLoading && ( <LoaderCircle size={'1.5rem'} /> )}
                                        Create Account
                                    </button>
                                </div>
                            </>
                        )}

                        <div className={styles.login}>
                            <Link to="/login">
                                Already have an account? Log in.
                            </Link>
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

export default SignUp;
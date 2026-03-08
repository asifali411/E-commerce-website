import { useState, ChangeEvent, FormEvent } from "react";
import styles from "./SignUP.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import mountain from "../../assets/mountain.jpg";
import axios, { AxiosError } from "axios";
import { useAuth } from "../../Context/AuthProvider";

/* ------------------ Types ------------------ */

type FormData = {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    contactNumber: string;
};

type FormErrors = {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    contactNumber: string;
};

type ErrorStates = {
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
    username: boolean;
    contactNumber: boolean;
};

/* ------------------ Component ------------------ */

const SignUp = () => {

/* Regex */

const emailRegex = /^[a-zA-Z0-9._%+-]+@gectcr\.ac\.in$/i;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const contactNumberRegex = /^\d{10}$/;

const navigate = useNavigate();
const { confirmLogin } = useAuth();

const [step, setStep] = useState(1);
const [signUPLoading, setSignUPLoading] = useState(false);

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    contactNumber: "",
});

const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    contactNumber: "",
});

const [errorStates, setErrorStates] = useState<ErrorStates>({
    email: false,
    password: false,
    confirmPassword: false,
    username: false,
    contactNumber: false,
});

/* ------------------ Handlers ------------------ */

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;

    setFormData(prev => ({
        ...prev,
        [name]: value
    }));

    if (errorStates[name as keyof ErrorStates]) {
        validateField(name as keyof FormData, value);
    }
};

/* ------------------ Validation ------------------ */

const validateField = (field: keyof FormData, value: string) => {

const newErrors = { ...errors };
const newStates = { ...errorStates };

switch (field) {

    case "email":
    if (!value.trim()) {
        newErrors.email = "Email is required";
        newStates.email = true;
    } else if (!emailRegex.test(value)) {
        newErrors.email = "Must be a valid college email";
        newStates.email = true;
    } else {
        newErrors.email = "";
        newStates.email = false;
    }
    break;

    case "password":
    if (!value) {
        newErrors.password = "Password is required";
        newStates.password = true;
    } else if (!passwordRegex.test(value)) {
        newErrors.password =
        "Minimum 8 characters, include letters, numbers & symbols";
        newStates.password = true;
    } else {
        newErrors.password = "";
        newStates.password = false;
    }
    break;

    case "confirmPassword":
    if (!value) {
        newErrors.confirmPassword = "Confirm your password";
        newStates.confirmPassword = true;
    } else if (value !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
        newStates.confirmPassword = true;
    } else {
        newErrors.confirmPassword = "";
        newStates.confirmPassword = false;
    }
    break;

    case "username":
    if (!value.trim()) {
        newErrors.username = "Username is required";
        newStates.username = true;
    } else if (value.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
        newStates.username = true;
    } else if (value.length > 20) {
        newErrors.username = "Username cannot exceed 20 characters";
        newStates.username = true;
    } else if (value.includes(" ")) {
        newErrors.username = "Username cannot contain spaces";
        newStates.username = true;
    } else {
        newErrors.username = "";
        newStates.username = false;
    }
    break;

    case "contactNumber":
    if (!value.trim()) {
        newErrors.contactNumber = "Contact number is required";
        newStates.contactNumber = true;
    } else if (!contactNumberRegex.test(value)) {
        newErrors.contactNumber = "Enter a valid 10-digit number";
        newStates.contactNumber = true;
    } else {
        newErrors.contactNumber = "";
        newStates.contactNumber = false;
    }
    break;
}

setErrors(newErrors);
setErrorStates(newStates);
};

/* ------------------ Step Validation ------------------ */

const validateStepOne = () => {
    validateField("email", formData.email);
    validateField("password", formData.password);
    validateField("confirmPassword", formData.confirmPassword);

    return (
        emailRegex.test(formData.email) &&
        passwordRegex.test(formData.password) &&
        formData.password === formData.confirmPassword
    );
};

const validateStepTwo = () => {
    validateField("username", formData.username);
    validateField("contactNumber", formData.contactNumber);

    return (
        formData.username.length >= 3 &&
        !formData.username.includes(" ") &&
        contactNumberRegex.test(formData.contactNumber)
    );
};

/* ------------------ Navigation ------------------ */

const goNext = () => {
    if (validateStepOne()) setStep(2);
};

/* ------------------ Submit ------------------ */

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (!validateStepTwo()) return;

    setSignUPLoading(true);

    const payload = {
        username: formData.username,
        email: formData.email,
        phone_no: formData.contactNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
    };

    try {

        const response = await axios.post("/api/register", payload);

        if (response.status === 200) {
            confirmLogin(formData.username);
            navigate("/");
        }

    } catch (error) {

        const err = error as AxiosError<any>;

        if (err.response?.status === 400) {

        const msg = "Username, email or contact number already in use";

        setErrorStates(prev => ({
            ...prev,
            username: true,
            email: true,
            contactNumber: true,
        }));

        setErrors(prev => ({
            ...prev,
            username: msg,
            email: msg,
            contactNumber: msg,
        }));
        }

    } finally {
        setSignUPLoading(false);
    }
};

/* ------------------ UI ------------------ */

return (
<div className={styles.container}>
    <div className={styles.card}>

    <div className={styles.left}>

        <header className={styles.header}>
        <h1>Create an account</h1>
        <p>Step {step} of 2</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>

        {/* STEP 1 */}

        {step === 1 && (
            <>
            {/* Email */}

            <div className={`${styles.inputGroup} ${errorStates.email ? styles.errorGroup : ""}`}>
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

            {/* Password */}

            <div className={`${styles.inputGroup} ${errorStates.password ? styles.errorGroup : ""}`}>
                <label>
                Password
                <p>{errors.password}</p>
                </label>

                <div className={styles.passwordInputWrapper}>
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                />

                <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setShowPassword(prev => !prev)}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
            </div>

            {/* Confirm Password */}

            <div className={`${styles.inputGroup} ${errorStates.confirmPassword ? styles.errorGroup : ""}`}>
                <label>
                Confirm Password
                <p>{errors.confirmPassword}</p>
                </label>

                <div className={styles.passwordInputWrapper}>
                <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />

                <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

        {/* STEP 2 */}

        {step === 2 && (
            <>
            <div className={`${styles.inputGroup} ${errorStates.username ? styles.errorGroup : ""}`}>
                <label>
                Username
                <p>{errors.username}</p>
                </label>

                <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                />
            </div>

            <div className={`${styles.inputGroup} ${errorStates.contactNumber ? styles.errorGroup : ""}`}>
                <label>
                Contact Number
                <p>{errors.contactNumber}</p>
                </label>

                <input
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>

                <button
                type="button"
                className={styles.googleBtn}
                onClick={() => setStep(1)}
                >
                Back
                </button>

                <button
                type="submit"
                className={styles.primaryBtn}
                disabled={signUPLoading}
                >
                {signUPLoading && <LoaderCircle size={20} />}
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
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus01, Eye, EyeOff } from "@untitledui/icons";
import styles from "./SignUp.module.css";
import { useAuth } from "../../context/AuthProvider";

/* ── Types ── */

type FormData = {
  email: string;
  username: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  email: string;
  username: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
};

/* ── Regex ── */

const emailRegex = /^[a-zA-Z0-9._%+-]+@gectcr\.ac\.in$/i;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const contactRegex = /^\d{10}$/;

/* ── Component ── */

function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    username: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  /* ── Validation ── */

  const validateField = (
    name: keyof FormData,
    value: string,
    data = formData,
  ): string => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Must be a valid college email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (!passwordRegex.test(value))
          return "Min 8 chars with letters, numbers & symbols";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== data.password) return "Passwords do not match";
        return "";
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Must be at least 3 characters";
        if (value.length > 20) return "Cannot exceed 20 characters";
        if (value.includes(" ")) return "Cannot contain spaces";
        return "";
      case "contactNumber":
        if (!value.trim()) return "Contact number is required";
        if (!contactRegex.test(value)) return "Enter a valid 10-digit number";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof FormData, value, updated),
      }));
    }
  };

  const validateStep = (fields: (keyof FormData)[]): boolean => {
    const newErrors = { ...errors };
    let valid = true;
    fields.forEach((f) => {
      const msg = validateField(f, formData[f]);
      newErrors[f] = msg;
      if (msg) valid = false;
    });
    setErrors(newErrors);
    return valid;
  };

  /* ── Navigation ── */

  const goNext = () => {
    if (validateStep(["email", "password", "confirmPassword"])) setStep(2);
  };

  const goBack = () => setStep(1);

  /* ── Submit ── */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep(["username", "contactNumber"])) return;

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        phone_no: formData.contactNumber,
        password: formData.password,
      });

      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        "Something went wrong. Please try again.";

      setErrors((prev) => ({
        ...prev,
        username: typeof msg === "string" ? msg : "Registration failed",
      }));

      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  /* ── UI ── */

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* LEFT */}
        <div className={styles.left}>
          <div className={styles.gradient} />
          <div className={styles.circleOne} />
          <div className={styles.circleTwo} />
          <div className={styles.brand}>
            <div className={styles.logo}>CB</div>
            <h2>CampusBid</h2>
            <p>Buy, sell, and bid within your campus</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <h1>Create account</h1>

          {/* Step indicator */}
          <div className={styles.steps}>
            <div
              className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}
            >
              <span>1</span> Credentials
            </div>
            <div className={styles.stepLine} />
            <div
              className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}
            >
              <span>2</span> Profile
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                {/* Email */}
                <div
                  className={`${styles.field} ${errors.email ? styles.fieldError : ""}`}
                >
                  <div className={styles.labelRow}>
                    <label htmlFor="email">Email</label>
                    {errors.email && (
                      <span className={styles.errorMsg}>{errors.email}</span>
                    )}
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div
                  className={`${styles.field} ${errors.password ? styles.fieldError : ""}`}
                >
                  <div className={styles.labelRow}>
                    <label htmlFor="password">Password</label>
                    {errors.password && (
                      <span className={styles.errorMsg}>{errors.password}</span>
                    )}
                  </div>
                  <div className={styles.passwordWrapper}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div
                  className={`${styles.field} ${errors.confirmPassword ? styles.fieldError : ""}`}
                >
                  <div className={styles.labelRow}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    {errors.confirmPassword && (
                      <span className={styles.errorMsg}>
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                  <div className={styles.passwordWrapper}>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      onClick={() => setShowConfirm((p) => !p)}
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.button}
                  onClick={goNext}
                >
                  Next →
                </button>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                {/* Username */}
                <div
                  className={`${styles.field} ${errors.username ? styles.fieldError : ""}`}
                >
                  <div className={styles.labelRow}>
                    <label htmlFor="username">Username</label>
                    {errors.username && (
                      <span className={styles.errorMsg}>{errors.username}</span>
                    )}
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                {/* Contact Number */}
                <div
                  className={`${styles.field} ${errors.contactNumber ? styles.fieldError : ""}`}
                >
                  <div className={styles.labelRow}>
                    <label htmlFor="contactNumber">Contact Number</label>
                    {errors.contactNumber && (
                      <span className={styles.errorMsg}>
                        {errors.contactNumber}
                      </span>
                    )}
                  </div>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    className={styles.buttonOutline}
                    onClick={goBack}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className={styles.button}
                    disabled={loading}
                  >
                    <UserPlus01 size={16} />
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className={styles.footer}>
            <span>Already have an account?</span>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn01, Eye, EyeOff } from "../../global/icons";
import styles from "./Login.module.css";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../../components/toast/Toast";

type FormData = { username: string; password: string };
type FormErrors = { username: string; password: string };

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (name: keyof FormData, value: string): string => {
    if (name === "username") return value.trim() ? "" : "Username is required";
    if (name === "password") return value ? "" : "Password is required";
    return "";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof FormData, value),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      username: validateField("username", formData.username),
      password: validateField("password", formData.password),
    };
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.username, formData.password);

      navigate("/");
    } catch (err: unknown) {
      
      //@ts-expect-error
      switch(err?.response?.status) {
        case 400:
          setErrors({
            username: "Invalid username or password",
            password: "Invalid username or password",
          });
          addToast({
            type: "error",
            title: "Invalid username or password.",
            message: "Please recheck your username and password.",
            duration: 4000,
          });
          break;
        default:
          setErrors({
            username: "Something went wrong. Please try again.",
            password: "",
          });
  
          addToast({
            type: "error",
            title: "Something went wrong. Please try again.",
            message: "",
            duration: 4000,
          });
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h1>Welcome back</h1>
          <p className={styles.subtitle}>Login to continue</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.forgotRow}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className={styles.button} disabled={loading}>
              <LogIn01 size={18} />
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={styles.footer}>
            <span>Don't have an account?</span>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
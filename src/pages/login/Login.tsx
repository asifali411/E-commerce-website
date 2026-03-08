import { useState, ChangeEvent, FormEvent } from "react";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import mountain from "../../assets/mountain.jpg";
import { useAuth } from "../../Context/AuthProvider";
import axios, { AxiosError } from "axios";

/* ---------------- Types ---------------- */

type LoginFormData = {
  username: string;
  password: string;
};

type LoginErrors = {
  username: string;
  password: string;
};

type ErrorStates = {
  username: boolean;
  password: boolean;
};

/* ---------------- Component ---------------- */

const Login = () => {

  const navigate = useNavigate();
  const { confirmLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showLoginLoading, setShowLoginLoading] = useState(false);

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({
    username: "",
    password: "",
  });

  const [errorStates, setErrorStates] = useState<ErrorStates>({
    username: false,
    password: false,
  });

  /* ---------------- Input Change ---------------- */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errorStates[name as keyof ErrorStates]) {
      validateField(name as keyof LoginFormData, value);
    }
  };

  /* ---------------- Validation ---------------- */

  const validateField = (field: keyof LoginFormData, value: string) => {

    const newErrors = { ...errors };
    const newStates = { ...errorStates };

    switch (field) {

      case "username":
        if (!value.trim()) {
          newErrors.username = "Username is required";
          newStates.username = true;
        } else {
          newErrors.username = "";
          newStates.username = false;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
          newStates.password = true;
        } else {
          newErrors.password = "";
          newStates.password = false;
        }
        break;
    }

    setErrors(newErrors);
    setErrorStates(newStates);
  };

  const validateForm = () => {

    const newErrors: LoginErrors = {
      username: "",
      password: "",
    };

    const newStates: ErrorStates = {
      username: false,
      password: false,
    };

    let hasErrors = false;

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      newStates.username = true;
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      newStates.password = true;
      hasErrors = true;
    }

    setErrors(newErrors);
    setErrorStates(newStates);

    return !hasErrors;
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (!validateForm()) return;

    setShowLoginLoading(true);

    try {

      const formURL = new URLSearchParams();

      formURL.append("username", formData.username);
      formURL.append("password", formData.password);
      formURL.append("grant_type", "password");
      formURL.append("scope", "");
      formURL.append("client_id", "");
      formURL.append("client_secret", "");

      const response = await axios.post(
        "/api/login",
        formURL,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 200) {
        confirmLogin(formData.username);
        navigate("/");
      }

    } catch (error) {

      const err = error as AxiosError;

      if (err.response?.status === 401) {

        setErrorStates({
          username: true,
          password: true
        });

        setErrors({
          username: "Invalid username or password",
          password: "Invalid username or password"
        });
      }

      console.error(err);

    } finally {
      setShowLoginLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

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

            {/* Username */}

            <div className={`${styles.inputGroup} ${errorStates.username ? styles.errorGroup : ""}`}>
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

            {/* Password */}

            <div className={`${styles.inputGroup} ${errorStates.password ? styles.errorGroup : ""}`}>
              <label htmlFor="password">
                Password
                <p>{errors.password}</p>
              </label>

              <div className={styles.passwordInputWrapper}>
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
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.forgot}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={showLoginLoading}
            >
              {showLoginLoading && <LoaderCircle size={20} />}
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
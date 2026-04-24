import { useState, useRef, useEffect } from "react";
import styles from "./ForgotPassword.module.css";

type Step = "email" | "sent";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validate = (value: string) => {
    if (!value.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Please enter a valid email address.";
    return "";
  };

  // backend guy is tough and wont let me add BASICC!!! functionalities...
  // so the below code wont work :P
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(email);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    // Simulate network delay ;)
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setStep("sent");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(validate(e.target.value));
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden />
      <div className={styles.blob2} aria-hidden />

      <div className={styles.card}>
        <div className={styles.iconWrap} aria-hidden>
          {step === "email" ? (
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
            >
              <rect
                x="4"
                y="10"
                width="32"
                height="22"
                rx="4"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M4 14l16 10 16-10"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`${styles.icon} ${styles.iconSuccess}`}
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M13 20.5l5 5 9-10"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {step === "email" ? (
          <>
            <h1 className={styles.heading}>Forgot your password?</h1>
            <p className={styles.subtext}>
              Enter the email linked to your account and we'll send you a reset
              link.
            </p>

            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              <div
                className={`${styles.field} ${error ? styles.fieldError : ""}`}
              >
                <label htmlFor="email" className={styles.label}>
                  Email address
                </label>
                <input
                  ref={inputRef}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@gectcr.ac.in"
                  value={email}
                  onChange={handleChange}
                  className={styles.input}
                  aria-describedby={error ? "email-error" : undefined}
                  aria-invalid={!!error}
                />
                {error && (
                  <span
                    id="email-error"
                    className={styles.errorMsg}
                    role="alert"
                  >
                    {error}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${styles.btn} ${loading ? styles.btnLoading : ""}`}
              >
                {loading ? (
                  <span className={styles.spinner} aria-hidden />
                ) : null}
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successState}>
            <h1 className={styles.heading}>Check your inbox</h1>
            <p className={styles.subtext}>
              We've sent a password reset link to{" "}
              <strong className={styles.emailHighlight}>{email}</strong>. It
              expires in 30 minutes.
            </p>
            <p className={styles.subtextSmall}>
              Didn't receive it? Check your spam folder, or{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setStep("email");
                  setEmail("");
                }}
              >
                try again
              </button>
              .
            </p>
          </div>
        )}

        <div className={styles.footer}>
          <a href="/login" className={styles.backLink}>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}

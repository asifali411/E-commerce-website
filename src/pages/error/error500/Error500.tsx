import { useNavigate } from "react-router-dom";
import styles from "./Error500.module.css";

export default function Error500() {
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.codeWrapper}>
          <span className={styles.five}>5</span>
          <div className={styles.zeroWrapper}>
            <div className={styles.zero}></div>
          </div>
          <div className={styles.zeroWrapper}>
            <div className={styles.zero}></div>
          </div>
        </div>

        <div className={styles.divider} />

        <h1 className={styles.heading}>Something went wrong</h1>
        <p className={styles.subtext}>
          We encountered an unexpected problem on our end. Please try refreshing
          the page or head back to the homepage.
        </p>

        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => navigate("/")}>
            Go home
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate(-1)}>
            Refresh
          </button>
        </div>

        <p className={styles.errorCode}>Error code: 500</p>
      </div>
    </div>
  );
}

import styles from "./Spinner.module.css";

export default function Spinner({size = 32}: {size?: number}) {
    return (
      <span
        className={styles.spinner}
        style={{minWidth: size, minHeight: size}}
      ></span>
    );
}
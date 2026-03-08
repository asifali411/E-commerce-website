import styles from './SkeletonLoader.module.css';

const SkeletonLoader = () => {
    return (
        <div className={styles.card}>
            <div className={`${styles.images} ${styles.skeleton}`}></div>

            <div className={`${styles.title} ${styles.skeleton}`}></div>
            <div className={`${styles.description} ${styles.skeleton}`}></div>
        </div>
);
}

export default SkeletonLoader;
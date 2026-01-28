import styles from './ItemCard.module.css';

const ItemCard = () => {

    return (
        <div className={styles.card}>
            <div className={styles.images}>
                <img src="" alt="" />

                
            </div>

            <div className={styles.title}>Title</div>
            <div className={styles.description}>Description</div>
        </div>
    );
}

export default ItemCard;
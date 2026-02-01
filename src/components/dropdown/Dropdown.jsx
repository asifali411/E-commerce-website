import styles from './Dropdown.module.css';

const Dropdown = ( {children, additionalStyles} ) => {
    return (
        <div className={styles.container} style={additionalStyles}> {children} </div>
    );
}

export default Dropdown;
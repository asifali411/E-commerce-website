import styles from './DropdownItem.module.css';

const DropdownItem = ( {children, additionalStyles, clickEvent} ) => {
    return (
        <div className={styles.container} style={additionalStyles} onClick={clickEvent}> {children} </div>
    );
}

export default DropdownItem;
import styles from './DropdownItem.module.css';
import { ReactNode, CSSProperties } from 'react';

interface DropdownItemProps {
    children: ReactNode;
    additionalStyles?: CSSProperties;
    clickEvent: () => void;
}

const DropdownItem = ( {children, additionalStyles = {}, clickEvent}: DropdownItemProps ) => {
    return (
        <div className={styles.container} style={additionalStyles} onClick={clickEvent}> {children} </div>
    );
}

export default DropdownItem;
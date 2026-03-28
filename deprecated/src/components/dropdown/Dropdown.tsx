import styles from './Dropdown.module.css';
import { ReactNode, CSSProperties } from 'react';

interface DropdownProps {
    children: ReactNode;
    additionalStyles?: CSSProperties;
}

const Dropdown = ({ children, additionalStyles = {} }: DropdownProps) => {
    return (
        <div className={styles.container} style={additionalStyles}>
            {children}
        </div>
    );
};

export default Dropdown;
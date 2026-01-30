import { useState, useRef, useEffect } from 'react';
import styles from './NavBar.module.css';
import { Search, House, Settings, Wallet, Bell } from 'lucide-react';

const NavBar = () => {
    const [active, setActive] = useState('home');
    const searchInputRef = useRef(null);

    const navItem = (name, label, Icon, extraStyle = {}) => (
        <div
            tabIndex={0}
            role='button'
            className={`${styles.iconContainer} ${active === name ? styles.selected : ''
                }`}
            style={extraStyle}
            onClick={() => setActive(name)}
        >
            <span>{label}</span>
            <Icon />
        </div>
    );

    useEffect(() => {
        if (active === 'search') {
            searchInputRef.current?.focus();
        }
    }, [active]);

    return (
        <div className={styles.container}>
            {navItem('home', 'Home', House)}
            {navItem('search', 'Search', Search, { marginLeft: '2em' })}
            {navItem('listings', 'My Listings', Wallet, { marginLeft: '1em' })}
            {navItem('notification', 'Notifications', Bell)}
            {navItem('settings', 'Settings', Settings)}

            <form className={styles.search} style={{
                opacity: `${active === "search" ? "1" : "0"}`, top: `${active === "search" ? "calc(-100% - 0.5rem)" : "100%"}` }}>
                <input type="text" ref={searchInputRef} className={styles.search__input} placeholder="Search..." />
                <button className={styles.search__button}>
                    <Search size={'1rem'}/>
                </button>
            </form>
        </div>
    );
};

export default NavBar;
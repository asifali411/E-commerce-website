import { act, useState } from 'react';
import styles from './NavBar.module.css';
import { Search, House, Settings, Wallet, Bell } from 'lucide-react';

const NavBar = () => {
    const [active, setActive] = useState('home');

    const navItem = (name, label, Icon, extraStyle = {}) => (
        <div
            className={`${styles.iconContainer} ${active === name ? styles.selected : ''
                }`}
            style={extraStyle}
            onClick={() => setActive(name)}
        >
            <span>{label}</span>
            <Icon />
        </div>
    );

    return (
        <div className={styles.container}>
            {navItem('home', 'Home', House)}
            {navItem('search', 'Search', Search, { marginLeft: '2em' })}
            {navItem('listings', 'My Listings', Wallet, { marginLeft: '1em' })}
            {navItem('notification', 'Notifications', Bell)}
            {navItem('settings', 'Settings', Settings)}

            <div className={styles.search} style={{
                opacity: `${active === "search" ? "1" : "0"}`, top: `${active === "search" ? "calc(-100% - 0.5rem)" : "100%"}` }}>
                <input type="text" class={styles.search__input} placeholder="Search..." />
                <button class={styles.search__button}>
                    <Search size={'1rem'}/>
                </button>
            </div>
        </div>
    );
};

export default NavBar;
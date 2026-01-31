import { useState, useRef, useEffect } from 'react';
import styles from './NavBar.module.css';
import { Search, House, Settings, Wallet, Bell } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const NavBar = () => {
    const [active, setActive] = useState('home');
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    const handleNavigation = (name, path) => {
        setActive(name);
        navigate(path);
    }

    const navItem = (name, label, Icon, extraStyle = {}, path = "/") => (
        <div
            tabIndex={0}
            role='button'
            className={`${styles.iconContainer} ${active === name ? styles.selected : ''
                }`}
            style={extraStyle}
            onClick={() => handleNavigation(name, path)}
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
            {navItem('search', 'Search', Search,{ marginLeft: '2em' })}
            {navItem('listings', 'My Listings', Wallet, { marginLeft: '1em' }, "/docs")}
            {navItem('notification', 'Notifications', Bell, {}, "/notification")}
            {navItem('settings', 'Settings', Settings, {}, "/settings")}

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
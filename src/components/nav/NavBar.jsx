import { useState, useRef, useEffect } from 'react';
import styles from './NavBar.module.css';
import { Search, House, Settings, Wallet, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef(null);
    
    // Local state ONLY for the search toggle
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Sync search focus
    useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus();
        }
    }, [isSearchOpen]);

    // Close search if the user navigates to a different page
    useEffect(() => {
        setIsSearchOpen(false);
    }, [location.pathname]);

    const handleNavigation = (name, path) => {
        if (name === 'search') {
            setIsSearchOpen(!isSearchOpen); // Toggle search UI
        } else {
            navigate(path); // Go to page
        }
    };

    const navItem = (name, label, Icon, extraStyle = {}, path = "/") => {
        // Highlighting logic:
        // If it's search, check local state. 
        // If it's a link, check if current path matches.
        const isActive = name === 'search' 
            ? isSearchOpen 
            : location.pathname === path;

        return (
            <div
                tabIndex={0}
                role='button'
                className={`${styles.iconContainer} ${isActive ? styles.selected : ''}`}
                style={extraStyle}
                onClick={() => handleNavigation(name, path)}
            >
                <span>{label}</span>
                <Icon />
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {navItem('home', 'Home', House, {}, "/")}
            {navItem('search', 'Search', Search, { marginLeft: '2em' })}
            {navItem('listings', 'My Listings', Wallet, { marginLeft: '1em' }, "/MyListings")}
            {navItem('notification', 'Notifications', Bell, {}, "/notification")}
            {navItem('settings', 'Settings', Settings, {}, "/settings")}

            {/* Form visibility is now tied to isSearchOpen */}
            <form className={styles.search} style={{
                opacity: isSearchOpen ? "1" : "0", 
                top: isSearchOpen ? "calc(-100% - 0.5rem)" : "100%",
                pointerEvents: isSearchOpen ? "all" : "none" 
            }}>
                <input type="text" ref={searchInputRef} className={styles.search__input} placeholder="Search..." />
                <button type="submit" className={styles.search__button}>
                    <Search size={'1rem'}/>
                </button>
            </form>
        </div>
    );
};

export default NavBar;
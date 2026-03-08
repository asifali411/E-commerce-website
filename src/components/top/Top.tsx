import styles from './Top.module.css';
import { useState, ReactNode, CSSProperties } from 'react';
import { CircleUserRound, Settings, CircleQuestionMark, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import Dropdown from '../dropdown/Dropdown';
import DropdownItem from '../dropdown/DropdownItem';

interface ProfileDropdownItem {
    icon: ReactNode;
    text: string;
    addStyles?: CSSProperties;
    onClick: () => void;
}

const Top = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

    const PROFILE_DROPDOWN: ProfileDropdownItem[] = [
        {
            icon: <CircleUserRound size="1.3rem" />,
            text: "My Profile",
            onClick: () => {
                setShowProfileDropdown(false);
                navigate('/profile');
            }
        },
        {
            icon: <Settings size="1.3rem" />,
            text: "Settings",
            onClick: () => {
                setShowProfileDropdown(false);
                navigate('/settings');
            }
        },
        {
            icon: <CircleQuestionMark size="1.3rem" />,
            text: "Help & Support",
            onClick: () => {
                setShowProfileDropdown(false);
                navigate('/help');
            }
        },
        {
            icon: <LogOut size="1.3rem" />,
            text: "Logout",
            addStyles: { color: 'tomato' },
            onClick: () => {
                setShowProfileDropdown(false);
                logout();
            }
        },
    ];

    return (
        <div className={styles.container}>
            <h1>Lorem ipsum.</h1>

            {isAuthenticated && (
                <div className={styles.profile}>

                    <div
                        className={styles.profileInfo}
                        onMouseDown={() => setShowProfileDropdown(prev => !prev)}
                    >
                        <span>{user ?? 'Profile'}</span>
                        <CircleUserRound size={24} />
                    </div>

                    {showProfileDropdown && (
                        <Dropdown>
                            {PROFILE_DROPDOWN.map((item, _) => (
                                <DropdownItem
                                    key={item.text}
                                    additionalStyles={item.addStyles}
                                    clickEvent={item.onClick}
                                >
                                    {item.icon} {item.text}
                                </DropdownItem>
                            ))}
                        </Dropdown>
                    )}
                </div>
            )}

            {!isAuthenticated && (
                <div className={styles.register}>
                    <button
                        type="button"
                        className={styles.secondary}
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        className={styles.primary}
                        onClick={() => navigate('/register')}
                    >
                        Sign up
                    </button>
                </div>
            )}
        </div>
    );
};

export default Top;
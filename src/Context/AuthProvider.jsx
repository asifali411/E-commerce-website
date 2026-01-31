import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';


const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const confirmLogin = (username) => {
        setUser(username);
    };

    const logout = () => {
        setUser(null);
    };

    const fetchUser = async () => {
        const response = await axios.get("/api/username", {
            withCredentials: true
        });

        return response.data.username;
    }

    const refreshToken = async () => {
        console.log("refreshing...");
        await axios.post("/api/refresh", { withCredentials: true });
        return fetchUser();
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const username = await fetchUser();
                confirmLogin(username);
            } catch (error) {
                try {
                    const username = await refreshToken();
                    confirmLogin(username);
                } catch (refreshError) {
                    logout();
                }
            }
        };

        initAuth();
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        confirmLogin,
        logout,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
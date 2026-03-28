import {
createContext,
useContext,
useEffect,
useState,
ReactNode
} from "react";
import axios from "axios";

/* ------------------ Axios Config ------------------ */

axios.defaults.withCredentials = true;

/* ------------------ Types ------------------ */

type AuthContextType = {
    user: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    confirmLogin: (username: string | null) => void;
    logout: () => Promise<void>;
    refreshToken: () => Promise<string | null>;
    fetchAllItems: (skip?: number, limit?: number) => Promise<any[]>;
    fetchUserItems: (skip?: number, limit?: number) => Promise<any[]>;
    fetchItem: (id: number) => Promise<any>;
};

type AuthProviderProps = {
    children: ReactNode;
};

/* ------------------ Context ------------------ */

const AuthContext = createContext<AuthContextType | null>(null);

/* ------------------ Provider ------------------ */

const AuthProvider = ({ children }: AuthProviderProps) => {
const [user, setUser] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

const confirmLogin = (username: string | null) => {
    setUser(username);
};

const logout = async () => {
    try {
        await axios.post("/api/logout", {}, {
            withCredentials: true
        });
    } finally {
        setUser(null);
    }
};

const fetchUser = async (): Promise<string | null> => {
    const response = await axios.get("/api/me", {
        withCredentials: true
    });
    return response.data.username ?? null;
};

const fetchAllItems = async (skip = 0, limit = 10): Promise<any[]> => {
    try {
        const response = await axios.get("/api/items/feed", {
            params: { skip, limit }
        });

        return response.data;
    } catch {
        return [];
    }
};

const fetchUserItems = async (skip = 0, limit = 10): Promise<any[]> => {
    try {
        const response = await axios.get("/api/items/myitems", {
            params: { skip, limit }
        });

        return response.data;
    } catch {
        return [];
    }
};

const fetchItem = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`/api/items/${id}`);
        return response.data;
    } catch {
        return {};
    }
};

const refreshToken = async (): Promise<string | null> => {
    try {
        await axios.post("/api/refresh", {}, { withCredentials: true });
        return await fetchUser();
    } catch {
        return null;
    }
};

/* ------------------ Init Auth ------------------ */

useEffect(() => {
    const initAuth = async () => {
        try {
            let username = await fetchUser();

            if (!username) {
                username = await refreshToken();
            }

            confirmLogin(username);
        } catch {
            confirmLogin(null);
        } finally {
            setLoading(false);
        }
    };

    initAuth();
}, []);

/* ------------------ Context Value ------------------ */

const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    confirmLogin,
    logout,
    refreshToken,
    fetchAllItems,
    fetchUserItems,
    fetchItem
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

/* ------------------ Hook ------------------ */

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
import {
  createContext, 
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import type { AdminItemResponse, AdminUniqueItemResponse } from "../global/schema";
import { api } from "./AuthProvider";

// --- Admin Context Type --------------------------------------
interface AdminContextType {
    isAdmin: boolean;
    setAdmin: (newState: boolean) => void;
    fetchReportedItems: (
        skip?: number,
        limit?: number,
    ) => Promise<AdminItemResponse[]>;
    fetchAdminItem: (itemId: number) => Promise<AdminUniqueItemResponse | null>;
    deleteAdminItem: (itemId: number) => Promise<string | null>;
}

// --- Context ------------------------------------------------
const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error("useAdmin must be used within AdminProvider");
    return context;
};

// --- Provider -----------------------------------------------
export const AdminProvider = ({ children }: { children: ReactNode }) => {

    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    const setAdmin = (newState: boolean) => {
      if(user?.role === "Admin") {
        setIsAdmin(newState);
      } else setIsAdmin(false);
    }

    const fetchReportedItems = async (
      skip = 0,
      limit = 10,
    ): Promise<AdminItemResponse[]> => {
      try {
        const res = await api.get<AdminItemResponse[]>(
          "/admin/reported-items",
          {
            params: { skip, limit },
          },
        );
        return Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("fetchReportedItems failed:", error);
        return [];
      }
    };

    const fetchAdminItem = async (
      itemId: number,
    ): Promise<AdminUniqueItemResponse | null> => {
      try {
        const res = await api.get<AdminUniqueItemResponse>(`/admin/${itemId}`);
        return res.data;
      } catch (error) {
        console.error("fetchAdminItem failed:", error);
        return null;
      }
    };

    const deleteAdminItem = async (itemId: number): Promise<string | null> => {
      try {
        const res = await api.delete(`/admin/${itemId}`);
        return res.data;
      } catch (error) {
        console.error("deleteAdminItem failed:", error);
        return null;
      }
    };

    useEffect(() => {
      if (user?.role !== "Admin") {
        setIsAdmin(false);
      }
    }, [user])

    // --- Context Value ----------------------------------------
    const value: AdminContextType = {
        isAdmin,
        setAdmin,
        fetchAdminItem,
        fetchReportedItems,
        deleteAdminItem
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

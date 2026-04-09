import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";


export default function ProtectedRoute() {
    const {isAuthenticated} = useAuth();
    const location = useLocation();

    if(!isAuthenticated){
        return <Navigate to="/login" state={{from: location}} replace></Navigate>;
    }

    return <Outlet />;
}
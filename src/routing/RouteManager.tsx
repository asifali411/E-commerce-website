import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Nav from "../components/nav/Nav";
import Home from "../pages/home/Home";
import MyListings from "../pages/myListings/MyListings";
import MyBids from "../pages/myBids/MyBids";
import Transactions from "../pages/transactions/Transactions";
import Ratings from "../pages/ratings/Ratings";
import Notifications from "../pages/notifications/Notifications";
import Login from "../pages/login/Login";
import SignUp from "../pages/signup/SignUp";
import ItemDetail from "../pages/itemDetail/ItemDetail";
import CreateItem from "../pages/createItem/CreateItem";
import Profile from "../pages/profile/Profile";
import EditItem from "../pages/editItem/EditItem";

import ForgotPassword from "../pages/forgotPassword/ForgotPassword";

import Error404 from "../pages/error/error404/Error404";
import Error500 from "../pages/error/error500/Error500";

import AdminPanel from "../pages/adminPanel/AdminPanel";
import ReportItemDetail from "../pages/reportItemDetail/ReportItemDetail";

function PageWrapper({ children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><SignUp /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />

        <Route element={<Nav />}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

            <Route path="/items/:id" element={<PageWrapper><ItemDetail /></PageWrapper>} />
            <Route path="/items/create" element={<PageWrapper><CreateItem /></PageWrapper>} />
            <Route path="/items/edit/:id" element={<PageWrapper><EditItem /></PageWrapper>} />

            <Route path="/listings" element={<PageWrapper><MyListings /></PageWrapper>} />
            <Route path="/bids" element={<PageWrapper><MyBids /></PageWrapper>} />
            <Route path="/transactions" element={<PageWrapper><Transactions /></PageWrapper>} />
            <Route path="/ratings" element={<PageWrapper><Ratings /></PageWrapper>} />
            
            <Route path="/notifications" element={<PageWrapper><Notifications /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />

            <Route path="/admin" element={<PageWrapper><AdminPanel /></PageWrapper>} />
            <Route path="/admin/reported-items/:id" element={<PageWrapper><ReportItemDetail /></PageWrapper>}></Route>
        </Route>

        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/500" element={<PageWrapper><Error500 /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><Error404 /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function RouteManager() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
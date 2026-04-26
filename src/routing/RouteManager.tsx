import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { lazy } from "react";

import Nav from "../components/nav/Nav";

const Home = lazy(() => import("../pages/home/Home"));
const MyListings = lazy(() => import("../pages/myListings/MyListings"));
const MyBids = lazy(() => import("../pages/myBids/MyBids"));
const Transactions = lazy(() => import("../pages/transactions/Transactions"));
const Ratings = lazy(() => import("../pages/ratings/Ratings"));
const Notifications = lazy(() => import("../pages/notifications/Notifications"));
const Login = lazy(() => import("../pages/login/Login"));
const SignUp = lazy(() => import("../pages/signup/SignUp"));
const ItemDetail = lazy(() => import("../pages/itemDetail/ItemDetail"));
const CreateItem = lazy(() => import("../pages/createItem/CreateItem"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const EditItem = lazy(() => import("../pages/editItem/EditItem"));

const ForgotPassword = lazy(() => import("../pages/forgotPassword/ForgotPassword"));

const Error404 = lazy(() => import("../pages/error/error404/Error404"));
const Error500 = lazy(() => import("../pages/error/error500/Error500"));

const AdminPanel = lazy(() => import("../pages/adminPanel/AdminPanel"));
const ReportItemDetail = lazy(() => import("../pages/reportItemDetail/ReportItemDetail"));

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
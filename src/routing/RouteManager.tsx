import { Route, Routes, BrowserRouter } from 'react-router-dom';

import Login from '../pages/login/Login';
import SignUP from '../pages/signUP/SignUP';

import Home from '../pages/home/Home';
import MyListings from '../pages/myListings/MyListings';

const RouteManager = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"
                    element={
                        <>
                            <Home />
                        </>
                    }
                />

                <Route path="/login" 
                    element = {
                        <>
                            <Login />
                        </>
                    }
                />

                <Route path="/register"
                    element={
                        <>
                            <SignUP />
                        </>
                    }
                />
                <Route path='/MyListings' element = {
                    <>
                    <MyListings/>
                    </>
                }/>

                <Route path="*"
                    element={
                        <>
                            <h1>Page not found</h1>
                        </>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default RouteManager;
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Register from './components/Register';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/ AdminDashboard';
import { UserProvider } from './context/UserContext';
import { BusProvider } from './context/BusContext';
import Bus from './components/Bus';
import AllRoutes from './components/AllRoutes';
import Schedule from './components/Schedule';
import { ScheduleProvider } from './context/ScheduleContext';
import { AllRouteProvider } from './context/RouteContext';
import { BookingProvider } from './context/BookingContext';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <UserProvider>
        <BookingProvider>
          <BusProvider>
            <ScheduleProvider>
              <AllRouteProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route path="/homepage" element={<HomePage />} /> 
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/user/dashboard" element={<UserDashboard />} />
                    <Route path="/adminDashboard" element={<AdminDashboard />} />
                    <Route path="/buses" element={<Bus />} />
                    <Route path="/AllRoutes" element={<AllRoutes />} /> {/* Added leading slash */}
                    <Route path="/schedules" element={<Schedule />} />
                  </Route>
                </Routes>
              </AllRouteProvider>
            </ScheduleProvider>
          </BusProvider>
        </BookingProvider>
      </UserProvider>
    </Router>
  );
}

export default App;

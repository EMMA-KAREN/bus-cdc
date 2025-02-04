import React from 'react';
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import HomePage from './HomePage';

export default function Layout() {
  return (
    <div>
      <Navbar />
      {/* <HomePage /> */}
      <div className="min-h-[90vh] bg-gray-200 container mx-auto p-8">
        <Outlet />
        <ToastContainer />
      </div>
      < HomePage/>
      <Footer />
    </div>
  );
}

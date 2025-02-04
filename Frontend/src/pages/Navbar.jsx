import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleNavigation = (type, action) => {
    if (action === 'login') {
      navigate(`/login?role=${type}`); // Navigate to the login page
    } else {
      navigate(`/${action}?role=${type}`);
    }
  };
  

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-white hover:text-gray-200">
        Bus Booking System
      </Link>
      <div className="flex gap-4">
        {/* Register Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-light dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            Register
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleNavigation("user", "register")}
              >
                User
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleNavigation("admin", "register")}
              >
                Admin
              </button>
            </li>
          </ul>
        </div>

        {/* Login Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-light dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            Login
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleNavigation("user", "login")}
              >
                User
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleNavigation("admin", "login")}
              >
                Admin
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

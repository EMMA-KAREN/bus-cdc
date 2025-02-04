import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Register() {
  const { addUser } = useContext(UserContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultRole = queryParams.get("role") || "user";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [role, setRole] = useState(defaultRole);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Passwords do not match!");
      return;
    }

    const newUser = {
      role,
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      gender,
      dateOfBirth,
    };

    addUser(newUser);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <form onSubmit={handleSubmit} className="card p-4 shadow-lg rounded w-50 bg-white">
        <h3 className="text-center mb-4 fw-bold text-primary">Register as {role === "admin" ? "Admin" : "User"}</h3>
        
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter First Name" required />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter Last Name" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Repeat Password</label>
          <input type="password" className="form-control" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} placeholder="Repeat Password" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input type="text" className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter Phone Number" />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter Address" />
        </div>

        <div className="mb-3">
          <label className="form-label">Gender</label>
          <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Date of Birth</label>
          <input type="date" className="form-control" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <input type="text" className="form-control bg-light" value={role} readOnly />
        </div>

        <button type="submit" className="btn btn-primary w-100">Sign Up</button>

        <div className="text-center mt-3">
          Already have an account? <Link to="/login" className="text-decoration-none text-primary">Login</Link>
        </div>
      </form>
    </div>
  );
}

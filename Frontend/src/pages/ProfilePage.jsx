import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { current_user, logout, setCurrentUser } = useContext(UserContext);
  const [user, setUser] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [errorMessage, setErrorMessage] = useState("");  
  const navigate = useNavigate();

  useEffect(() => {
    if (current_user) {
      const formattedDate = new Date(current_user.dateOfBirth).toISOString().split('T')[0];  
      setUser({
        ...current_user,
        dateOfBirth: formattedDate, 
      });
    }
  }, [current_user]);
  

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const dataToUpdate = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture || "",
    };

    try {
      const response = await fetch("https://bus-cdc-2.onrender.com/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(dataToUpdate),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update profile");
      }

      alert("Profile updated successfully!");
      setCurrentUser(responseData.user);
      setUser(responseData.user);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleDeleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      setLoading(true);  // Set loading state
      try {
        const response = await fetch("https://bus-cdc-2.onrender.com/user/delete_account", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || "Failed to delete account");
        }

        alert("Account deleted successfully!");
        setCurrentUser(null);
        localStorage.removeItem("access_token");
        navigate("/login");
      } catch (error) {
        console.error("Error deleting account:", error.message);
        setErrorMessage(error.message);  
      } finally {
        setLoading(false);  
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    logout(); 
    navigate("/login");
  };

  return (
    <div className="container mx-auto my-8 p-4 bg-white rounded shadow-lg">
      {current_user ? (
        <>
          <div className="flex flex-col items-center mb-8">
            <img
              src={user.profilePicture || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 rounded-full mb-4"
            />
            <h2 className="text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phoneNumber}</p>
            <p className="text-gray-600">{user.address}</p>
            <p className="text-gray-600">{user.gender}</p>
            <p className="text-gray-600">{user.dateOfBirth}</p>

            <Button variant="primary" onClick={handleShow} className="mt-4">
              Update Profile
            </Button>
            <Button variant="danger" onClick={handleDeleteProfile} className="mt-2">
              Delete Profile
            </Button>
            <Button variant="secondary" onClick={handleLogout} className="mt-2">
              Logout
            </Button>
          </div>

          {/* Update Profile Modal */}
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Update Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdateProfile}>
                <Form.Group controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="phoneNumber">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={user.address}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="profilePicture">
                  <Form.Label>Profile Picture URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="profilePicture"
                    value={user.profilePicture || ""}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                </Form.Group>

                {/* Gender Field */}
                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    as="select"
                    name="gender"
                    value={user.gender || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Control>
                </Form.Group>

                {/* Date of Birth Field */}
                <Form.Group controlId="dateOfBirth">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={user.dateOfBirth || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>

                {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
              </Form>
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default ProfilePage;

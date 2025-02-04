import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { BookingContext } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import { Card, Button, Table, Form, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { current_user } = useContext(UserContext);
  const { users, fetchUsers, bookings, fetchBookings } = useContext(BookingContext);
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!current_user || current_user.role !== "admin") {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        await fetchUsers();
        await fetchBookings();
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load user or booking data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [current_user, fetchUsers, fetchBookings, navigate]);

  const handleStatusChange = async () => {
    if (!selectedBooking) {
      toast.error("Please select a booking first");
      return;
    }
  
    if (!selectedStatus || !selectedPaymentStatus) {
      toast.error("Please select both status and payment status");
      return;
    }
  
    const payload = {
      status: selectedStatus,
      paymentStatus: selectedPaymentStatus,
    };
  
    console.log("Sending payload:", JSON.stringify(payload)); 
  
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch(
        `https://bus-cdc-1.onrender.com/bookings/${selectedBooking.bookingID}/admin/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
  
      const responseData = await response.json();
      console.log("Response data:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update booking status");
      }
  
      toast.success("Booking status updated successfully");
      await fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(error.message || "Failed to update booking status");
    }
  };
  
  return (
    <div className="container my-4">
      {current_user?.role === "admin" ? (
        <>
          <h1 className="text-center">Admin Dashboard</h1>
          <p className="text-center text-muted">Manage buses, routes, and schedules efficiently.</p>

          {/* Cards Section */}
          <div className="row mt-4">
            {[
              { title: "Route Management", img: "/image/routes.jpg", link: "/AllRoutes" },
              { title: "Schedule Management", img: "/image/schedules.jpg", link: "/schedules" },
              { title: "Bus Management", img: "/image/buses.jpg", link: "/buses" },
            ].map((item, index) => (
              <div key={index} className="col-md-4">
                <Card className="shadow-lg rounded-xl overflow-hidden cursor-pointer" onClick={() => navigate(item.link)}>
                  <Card.Img variant="top" src={item.img} className="h-48 object-cover" loading="lazy" />
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Button variant="primary">Go to {item.title.split(" ")[0]}</Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          {/* Bookings Management */}
          <div className="mt-5">
            <h2>Manage Bookings</h2>
            {loading ? (
              <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No bookings available</td>
                    </tr>
                  ) : (
                    bookings.map((booking) => {
                      const user = users.find((u) => u.userID === booking.userID);
                      return (
                        <tr key={booking.bookingID}>
                          <td>{booking.bookingID}</td>
                          <td>{user ? `${user.firstName} ${user.lastName}` : `User ID: ${booking.userID}`}</td>
                          <td>{booking.status}</td>
                          <td>{booking.paymentStatus}</td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setSelectedStatus(booking.status);
                                setSelectedPaymentStatus(booking.paymentStatus);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            )}
          </div>

          {/* Edit Booking Modal */}
          {selectedBooking && (
            <div className="mt-4">
              <h3>Edit Booking</h3>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Booking Status</Form.Label>
                  <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Payment Status</Form.Label>
                  <Form.Select value={selectedPaymentStatus} onChange={(e) => setSelectedPaymentStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleStatusChange}>Update Booking</Button>
                  <Button variant="secondary" onClick={() => setSelectedBooking(null)}>Cancel</Button>
                </div>
              </Form>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-danger">Unauthorized Access. Only admins can view this page.</p>
      )}
    </div>
  );
};

export default AdminDashboard;

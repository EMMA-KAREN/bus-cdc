import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { BookingContext } from "../context/BookingContext";
import { toast } from "react-toastify";
import Booking from '../pages/Booking';
import ProfilePage from '../pages/ProfilePage'; 

const UserDashboard = () => {
  const { bookings, fetchBookings, updateBooking, cancelBooking } = useContext(BookingContext);
  const { current_user } = useContext(UserContext);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newSeatNumbers, setNewSeatNumbers] = useState([]);
// Fetch all bookings when the user is logged in
  useEffect(() => {
    if (current_user) {
      fetchBookings();  
    }
  }, [current_user, fetchBookings]);

  console.log(bookings);  

  if (!current_user) {
    return <div>Loading user...</div>;
  }

  if (!bookings) {
    return <div>Loading bookings...</div>;
  }

  // If the user is an admin, show all bookings, else only show the current user's bookings
  const userBookings = current_user.role === "admin" ? bookings : bookings.filter(booking => booking.userID === current_user.userID);

  console.log("Current User:", current_user);

  const handleUpdateClick = (booking) => {
    setEditingBooking(booking);
    setNewSeatNumbers(booking.seatNumbers);
  };

  const handleSaveUpdate = async () => {
    if (!editingBooking) return;

    const updatedData = { seatNumbers: newSeatNumbers };

    try {
      await updateBooking(editingBooking.bookingID, updatedData);
      setEditingBooking(null);
      toast.success("Booking updated successfully.");
    } catch (error) {
      toast.error("Failed to update booking. Please try again.");
    }
  };

  const handleCancel = async (bookingID) => {
    try {
      await cancelBooking(bookingID);
      toast.success("Booking canceled successfully.");
    } catch (error) {
      toast.error("Failed to cancel booking.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome, {current_user.firstName}</h1>

      {/* Render Profile Page Component */}
      <ProfilePage /> 

      <h2 className="text-xl mt-4">{current_user.role === "admin" ? "All Bookings" : "Your Bookings"}</h2>

      {userBookings.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {userBookings.map((booking) => (
            <li key={booking.bookingID} className="border p-4 rounded-lg shadow-md">
              <p><strong>Schedule ID:</strong> {booking.scheduleID}</p>
              <p><strong>Seat Numbers:</strong> {booking.seatNumbers.join(', ')}</p>
              <p><strong>Status:</strong> {booking.status}</p>
              <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
              
              {editingBooking?.bookingID === booking.bookingID ? (
                <div className="mt-2">
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={newSeatNumbers.join(', ')}
                    onChange={(e) => setNewSeatNumbers(e.target.value.split(',').map(num => num.trim()))}
                  />
                  <div className="mt-2 space-x-2">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSaveUpdate}>Save</button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setEditingBooking(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-x-2">
                  {current_user.role === "admin" ? (
                    // Admin can delete or update any booking
                    <>
                      <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => handleUpdateClick(booking)}>Update</button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => handleCancel(booking.bookingID)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    // update or cancel their own bookings
                    <>
                      <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => handleUpdateClick(booking)}>Update</button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => handleCancel(booking.bookingID)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">No bookings found.</p>
      )}
      <Booking scheduleID={1} />
    </div>
  );
};

export default UserDashboard;

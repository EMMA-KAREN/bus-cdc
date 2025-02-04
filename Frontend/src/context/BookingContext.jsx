import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [authToken, setAuthToken] = useState(sessionStorage.getItem("token"));
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { current_user } = useContext(UserContext);
  
 // Fetch bookings for user or admin
 const fetchBookings = useCallback(async (userID = current_user?.userID) => {
  if (!authToken) return;

  try {
      const response = await fetch(`https://bus-cdc-2.onrender.com/bookings?userID=${userID}`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${authToken}`,
          },
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Bookings:", data);

      // set the bookings relevant to the user
      if (current_user?.role !== "admin") {
          setBookings(data.filter(booking => booking.userID === current_user.userID));
      } else {
          setBookings(data); 
      }
  } catch (error) {
      console.error("Fetch error:", error);
  }
}, [authToken, current_user]);

 
  
  // Fetch all users (for admin)
  const fetchUsers = useCallback(async () => {
    if (!authToken) return;
  
    try {
      const response = await fetch("https://bus-cdc-2.onrender.com/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        setUsers(data); 
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [authToken]);
  

  useEffect(() => {
    if (authToken) {
      fetchUsers();
    }
  }, [authToken, fetchUsers]);

  const bookBus = async (bookingData) => {
    try {
      const response = await fetch("https://bus-cdc-2.onrender.com/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Booking successful!");
        fetchBookings();
      } else {
        toast.error(result.message || "Failed to book bus.");
      }
    } catch (error) {
      toast.error("Booking failed. Try again.");
    }
  };

  const updateBookingStatus = async (bookingId, newStatus, newPaymentStatus) => {
    if (!authToken) return toast.error("Authentication required.");
    
    try {
      const response = await fetch(`https://bus-cdc-2.onrender.com/bookings/${bookingId}/admin/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          status: newStatus,
          paymentStatus: newPaymentStatus || "pending"
        }),
      });
  
      if (response.ok) {
        setBookings(bookings.map((b) =>
          b.bookingID === bookingId ? { ...b, status: newStatus, payment_status: newPaymentStatus } : b
        ));
        toast.success("Booking status updated.");
      } else {
        const result = await response.json();
        toast.error(result.error || "Failed to update booking status.");
      }
    } catch (error) {
      toast.error("Error updating booking status.");
    }
  };
  

  const updateBooking = async (bookingId, updatedData) => {
    if (!authToken) return toast.error("Authentication required.");
    try {
      const response = await fetch(`https://bus-cdc-2.onrender.com/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setBookings(bookings.map((b) =>
          b.bookingID === bookingId ? { ...b, ...updatedData } : b
        ));
        toast.success("Booking updated successfully.");
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to update booking.");
      }
    } catch (error) {
      toast.error("Error updating booking.");
    }
  };

  const cancelBooking = async (bookingID) => {
    if (!authToken) return toast.error("Authentication required.");
    
    try {
      const response = await fetch(`https://bus-cdc-2.onrender.com/bookings/${bookingID}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete booking");
      }
  
      toast.success("Booking deleted successfully!");
      setBookings(bookings.filter((booking) => booking.bookingID !== bookingID)); 
    } catch (error) {
      toast.error("Error deleting booking: " + error.message);
    }
  };
  
  
  
  
  const fetchRoutes = async () => {
    if (!authToken) return toast.error("Authentication token missing.");
    try {
      const response = await fetch("https://bus-cdc-2.onrender.com/routes", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (response.ok) {
        setRoutes(data);
      } else {
        toast.error(data.message || "Failed to fetch routes.");
      }
    } catch (error) {
      toast.error("Error fetching routes.");
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchRoutes();
    }
  }, [authToken]);

  return (
    <BookingContext.Provider value={{
      bookings, users, routes, fetchBookings, bookBus, updateBooking,
      cancelBooking, fetchUsers, updateBookingStatus, loading, error,
    }}>
  
      {children}
    </BookingContext.Provider>
  );
};

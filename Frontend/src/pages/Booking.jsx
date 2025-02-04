import React, { useState, useContext, useEffect } from 'react';
import { BusContext } from '../context/BusContext'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BookingContext } from '../context/BookingContext'; 
import { UserContext } from '../context/UserContext';

const Booking = ({ scheduleID }) => {
  const { bookBus, routes } = useContext(BookingContext); // Use bookBus function from context
  const { buses } = useContext(BusContext); // Use buses data from context
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const { current_user } = useContext(UserContext);

  // Set selected route
  const handleRouteSelection = (route) => {
    setSelectedRoute(route); 
  };

  useEffect(() => {
    if (buses && buses.length === 0) {
      toast.info('Fetching available buses...');
    }
  }, [buses]);

  // Reset selected seats when bus is changed
  const handleBusSelection = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]); 
  };


  const handleSeatSelection = (seat) => {
    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seat)
        ? prevSeats.filter((s) => s !== seat)
        : [...prevSeats, seat] 
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !selectedBus || !selectedRoute || selectedSeats.length === 0) {
      toast.error('Please fill all fields and select a bus, route, and seats!');
      return;
    }

    const bookingData = {
      userID: current_user.userID,
      scheduleID,
      busID: selectedBus.busID,
      seatNumbers: selectedSeats,
      totalPrice: selectedSeats.length * 100,
      paymentGateway: "Stripe",
      transactionID: `txn_${Date.now()}`,
      routeID: selectedRoute.routeID 
    };

    try {
      const response = await bookBus(bookingData);
      if (response && response.message === "Booking successful!") {
        toast.success('Booking confirmed!');
        setName('');
        setEmail('');
        setPhone('');
        setSelectedRoute(null);
        setSelectedBus(null);
        setSelectedSeats([]); 
      } else {
        toast.error('Error during booking. Please try again.');
      }
    } catch (error) {
      toast.error('Error during booking. Please try again.');
    }
  };

   
  return (
    <div className="container">
    <h2 className="my-4">Book Your Bus</h2>
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="form-control"
          required
        />
      </div>

        {/* Routes Selection */}
        <div className="form-group my-4">
          <h4>Select Route</h4>
          <div className="route-selection">
  {routes && routes.length > 0 ? (
    routes.map((route) => (
      <button
        key={route.routeID}
        type="button"
        onClick={() => handleRouteSelection(route)}
        className={`route-btn ${selectedRoute?.routeID === route.routeID ? 'selected' : ''}`}
      >
        {route.origin} to {route.destination}
      </button>
    ))
  ) : (
    <p>Loading available routes...</p>
  )}
</div>

        </div>

        {/* Bus Selection */}
        <div className="form-group my-4">
          <h4>Select Bus</h4>
          <div className="bus-selection">
            {buses && buses.length > 0 ? (
              buses.map((bus) => (
                <button
                  key={bus.busID}
                  type="button"
                  onClick={() => handleBusSelection(bus)}
                  className={`bus-btn ${selectedBus?.busID === bus.busID ? 'selected' : ''}`}
                >
                  {bus.busName}
                </button>
              ))
            ) : (
              <p>Loading available buses...</p>
            )}
          </div>
        </div>

        {/* Seats Selection */}
        {selectedBus && selectedBus.capacity && (
          <div className="form-group my-4">
            <h4>Select Seats</h4>
            <div className="seat-selection">
              {[...Array(selectedBus.capacity)].map((_, index) => (
                <button
                  key={index + 1}
                  type="button"
                  onClick={() => handleSeatSelection(index + 1)}
                  className={`seat-btn ${selectedSeats.includes(index + 1) ? 'selected' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default Booking;

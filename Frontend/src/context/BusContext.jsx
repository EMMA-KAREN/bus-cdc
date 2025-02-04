import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const BusContext = createContext();

export const BusProvider = ({ children }) => {
  const [buses, setBuses] = useState([]);
  const authToken = sessionStorage.getItem("token");

  const fetchBuses = async () => {
    if (!authToken) return toast.error("Authentication token missing.");
    try {
      const response = await fetch("https://bus-cdc-1.onrender.com/buses", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      setBuses(data);
    } catch (error) {
      toast.error("Failed to load buses.");
    }
  };

  const addBus = async (busData) => {
    if (!authToken) return toast.error("Authentication required.");
    try {
      const response = await fetch("https://bus-cdc-1.onrender.com/buses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(busData),
      });
      const result = await response.json();
      if (response.ok) {
        setBuses([...buses, { ...busData, busID: result.busID }]);
        toast.success("Bus added successfully.");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error adding bus.");
    }
  };

  const updateBus = async (busId, updatedData) => {
    if (!authToken) return toast.error("Authentication required.");
    try {
      const response = await fetch(`https://bus-cdc-1.onrender.com/buses/${busId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        setBuses(buses.map((bus) => (bus.busID === busId ? { ...bus, ...updatedData } : bus)));
        toast.success("Bus updated.");
      } else {
        const result = await response.json();
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error updating bus.");
    }
  };

  const deleteBus = async (busId) => {
    if (!authToken) return toast.error("Authentication required.");
    try {
      const response = await fetch(`https://bus-cdc-1.onrender.com/buses/${busId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        setBuses(buses.filter((bus) => bus.busID !== busId));
        toast.success("Bus deleted.");
      } else {
        const result = await response.json();
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error deleting bus.");
    }
  };

  useEffect(() => {
    if (authToken) fetchBuses();
  }, [authToken]);

  return <BusContext.Provider value={{ buses, addBus, updateBus, deleteBus }}>{children}</BusContext.Provider>;
};

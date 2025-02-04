import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const RouteContext = createContext(); // This should be exported

export const AllRouteProvider = ({ children }) => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Fetch all routes
  const fetchRoutes = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/routes");
      setRoutes(response.data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  // Add a new route
  const addRoute = async (routeData) => {
    try {
      const authToken = sessionStorage.getItem("token"); // Ensure you get the token here
      const response = await axios.post("http://127.0.0.1:5000/routes", routeData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      setRoutes([...routes, response.data.route]);
    } catch (error) {
      console.error("Error adding route:", error);
    }
  };
  
  const updateRoute = async (routeId, updatedData) => {
    try {
      const authToken = sessionStorage.getItem("token");
      const response = await axios.put(`http://127.0.0.1:5000/routes/${routeId}`, updatedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      setRoutes(routes.map(route => (route.routeID === routeId ? response.data.route : route)));
    } catch (error) {
      console.error("Error updating route:", error);
    }
  };
  
  const deleteRoute = async (routeId) => {
    try {
      const authToken = sessionStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/routes/${routeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setRoutes(routes.filter(route => route.routeID !== routeId));
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };
  

  return (
    <RouteContext.Provider value={{ routes, addRoute, updateRoute, deleteRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

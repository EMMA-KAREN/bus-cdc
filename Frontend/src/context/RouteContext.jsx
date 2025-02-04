import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const RouteContext = createContext(); 
export const AllRouteProvider = ({ children }) => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Fetch all routes
  const fetchRoutes = async () => {
    try {
      const response = await axios.get("https://bus-cdc-1.onrender.com/routes");
      setRoutes(response.data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  // Add a new route
  const addRoute = async (routeData) => {
    try {
      const authToken = sessionStorage.getItem("token"); 
      const response = await axios.post("https://bus-cdc-1.onrender.com/routes", routeData, {
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
      const response = await axios.put(`https://bus-cdc-1.onrender.com/routes/${routeId}`, updatedData, {
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
      await axios.delete(`https://bus-cdc-1.onrender.com/routes/${routeId}`, {
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

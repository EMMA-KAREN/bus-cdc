import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const authToken = sessionStorage.getItem("token");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get("https://bus-cdc-2.onrender.com/schedules", axiosConfig);
      setSchedules(response.data);
    } catch (error) {
      toast.error("Error fetching schedules");
      console.error("Fetch schedules error:", error);
    }
  };

  const addSchedule = async (scheduleData) => {
    try {
      const response = await axios.post("https://bus-cdc-2.onrender.com/schedules", scheduleData, axiosConfig);
      setSchedules([...schedules, response.data]);
      toast.success("Schedule added successfully");
    } catch (error) {
      toast.error("Error adding schedule");
      console.error("Add schedule error:", error);
    }
  };

  const updateSchedule = async (scheduleID, updatedData) => {
    try {
      console.log("Updating schedule with ID:", scheduleID);
      const response = await axios.put(`https://bus-cdc-2.onrender.com/schedules/${scheduleID}`, updatedData, axiosConfig);
      const updatedSchedule = response.data.schedule;
      setSchedules(schedules.map((s) => (s.scheduleID === scheduleID ? updatedSchedule : s)));
      toast.success("Schedule updated successfully");
    } catch (error) {
      toast.error("Error updating schedule");
      console.error("Update schedule error:", error.response?.data || error.message);
    }
  };
  
  
  

  const deleteSchedule = async (scheduleID) => {
    try {
      await axios.delete(`https://bus-cdc-2.onrender.com/schedules/${scheduleID}`, axiosConfig);
      setSchedules(schedules.filter((s) => s.scheduleID !== scheduleID));
      toast.success("Schedule deleted successfully");
    } catch (error) {
      toast.error("Error deleting schedule");
      console.error("Delete schedule error:", error);
    }
  };

  return (
    <ScheduleContext.Provider value={{ schedules, addSchedule, updateSchedule, deleteSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

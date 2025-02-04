import React, { useContext, useState } from "react";
import { ScheduleContext } from "../context/ScheduleContext";
import { Modal, Button, Form, Table, Container } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const navigate = useNavigate();
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useContext(ScheduleContext);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    busID: "",
    routeID: "",
    departureTime: "",
    arrivalTime: "",
    fare: "",
    daysOfOperation: "",
  });

  const handleShowModal = (schedule = null) => {
    if (schedule) {
      setScheduleData(schedule);
      setEditMode(true);
      setSelectedSchedule(schedule.scheduleID);
    } else {
      setScheduleData({
        busID: "",
        routeID: "",
        departureTime: "",
        arrivalTime: "",
        fare: "",
        daysOfOperation: "",
      });
      setEditMode(false);
      setSelectedSchedule(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    setScheduleData({ ...scheduleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode && selectedSchedule) {
      updateSchedule(selectedSchedule, scheduleData);
      toast.success("Schedule updated successfully!");
    } else if (!editMode) {
      addSchedule(scheduleData);
      toast.success("Schedule added successfully!");
    } else {
      toast.error("No schedule selected to update.");
    }
    handleCloseModal();
  };

  return (
    <Container className="mt-4 p-4 bg-light shadow rounded">
      <button
        className="px-5 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg shadow-md
                   transition-all duration-300 hover:scale-105 hover:from-purple-500 hover:to-blue-400
                   border border-gray-400 mb-3"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary">Bus Schedules</h2>
        <Button variant="success" className="shadow" onClick={() => handleShowModal()}>
          + Add Schedule
        </Button>
      </div>

      <Table striped bordered hover responsive className="shadow">
        <thead className="bg-dark text-white">
          <tr>
            <th>#</th>
            <th>Bus ID</th>
            <th>Route ID</th>
            <th>Departure Time</th>
            <th>Arrival Time</th>
            <th>Fare</th>
            <th>Days of Operation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((schedule, index) => (
              <tr key={schedule.scheduleID}>
                <td>{index + 1}</td>
                <td>{schedule.busID}</td>
                <td>{schedule.routeID}</td>
                <td>{schedule.departureTime}</td>
                <td>{schedule.arrivalTime}</td>
                <td>${schedule.fare}</td>
                <td>{schedule.daysOfOperation}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 shadow-sm"
                    onClick={() => handleShowModal(schedule)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="shadow-sm"
                    onClick={() => deleteSchedule(schedule.scheduleID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No schedules available.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} className="fade">
        <Modal.Header closeButton>
          <Modal.Title className="text-dark">
            {editMode ? "Edit Schedule" : "Add Schedule"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Bus ID</Form.Label>
              <Form.Control
                type="text"
                name="busID"
                value={scheduleData.busID}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Route ID</Form.Label>
              <Form.Control
                type="text"
                name="routeID"
                value={scheduleData.routeID}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Departure Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="departureTime"
                value={scheduleData.departureTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Arrival Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="arrivalTime"
                value={scheduleData.arrivalTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Fare</Form.Label>
              <Form.Control
                type="number"
                name="fare"
                value={scheduleData.fare}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Days of Operation</Form.Label>
              <Form.Control
                type="text"
                name="daysOfOperation"
                value={scheduleData.daysOfOperation}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="shadow w-100">
              {editMode ? "Update Schedule" : "Add Schedule"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Schedule;

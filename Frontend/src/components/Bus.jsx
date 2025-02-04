import React, { useContext, useState } from "react";
import { BusContext } from "../context/BusContext";
import { Modal, Button, Card, Container, Row, Col, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Bus = () => {
  const navigate = useNavigate();
  const { buses, addBus, updateBus, deleteBus } = useContext(BusContext);

  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  
  const [newBus, setNewBus] = useState({
    busName: "", busType: "", capacity: "", operator: "", registrationNumber: "", amenities: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBus({ ...newBus, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdating && selectedBus) {
      updateBus(selectedBus.busID, newBus);
      toast.success("Bus updated successfully!");
      setIsUpdating(false);
      setSelectedBus(null);
    } else {
      addBus(newBus);
      toast.success("Bus added successfully!");
    }
    setShowModal(false);
    setNewBus({ busName: "", busType: "", capacity: "", operator: "", registrationNumber: "", amenities: "" });
  };

  const handleUpdateBus = (busId) => {
    const bus = buses.find((b) => b.busID === busId);
    setSelectedBus(bus);
    setNewBus(bus);
    setIsUpdating(true);
    setShowModal(true);
  };

  const handleDeleteBus = (busId) => {
    if (!busId) return toast.error("Bus ID is missing");
    deleteBus(busId);
    toast.success("Bus deleted successfully!");
  };

  return (
    <Container className="mt-4 p-4 bg-gradient-to-r from-pink-300 via-teal-200 to-cream-100 shadow-lg rounded">
      {/* Back Button */}
      <button
        className="mb-3 px-5 py-2 bg-gradient-to-r from-teal-400 to-pink-500 text-white rounded-lg shadow-md
                   transition-all duration-300 hover:scale-105 hover:from-pink-500 hover:to-teal-400"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <h2 className="text-center text-primary">Bus List</h2>

      <div className="d-flex justify-content-center my-3">
        <Button variant="success" className="shadow" onClick={() => setShowModal(true)}>
          + Add Bus
        </Button>
      </div>

      {/* Bus Cards */}
      <Row className="mt-3">
        {buses.length > 0 ? (
          buses.map((bus) => (
            <Col key={bus.busID} md={4} className="mb-3">
              <Card className="shadow-md border-l-4 border-teal-500 transition-all transform hover:scale-105 hover:shadow-lg hover:bg-pink-100">
                <Card.Body>
                  <Card.Title className="text-gray-800 font-bold">{bus.busName}</Card.Title>
                  <Card.Text><strong>Type:</strong> {bus.busType}</Card.Text>
                  <Card.Text><strong>Seats:</strong> {bus.capacity}</Card.Text>
                  <Card.Text><strong>Operator:</strong> {bus.operator}</Card.Text>
                  <Card.Text><strong>Reg No:</strong> {bus.registrationNumber}</Card.Text>
                  <Card.Text><strong>Amenities:</strong> {bus.amenities}</Card.Text>
                  <div className="flex gap-2 mt-3">
                    <Button variant="warning" size="sm" className="shadow-sm" onClick={() => handleUpdateBus(bus.busID)}>Edit</Button>
                    <Button variant="danger" size="sm" className="shadow-sm" onClick={() => handleDeleteBus(bus.busID)}>Delete</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center text-muted">No buses available.</p>
        )}
      </Row>

      {/* Modal for Adding/Editing Bus */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isUpdating ? "Update Bus" : "Add New Bus"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {Object.keys(newBus).map((key) => (
              <Form.Group controlId={key} key={key} className="mb-3">
                <Form.Label>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</Form.Label>
                <Form.Control
                  type={key === "capacity" ? "number" : "text"}
                  placeholder={`Enter ${key}`}
                  name={key}
                  value={newBus[key]}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            ))}
            <Button variant="primary" type="submit" className="w-100">
              {isUpdating ? "Update Bus" : "Add Bus"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Bus;

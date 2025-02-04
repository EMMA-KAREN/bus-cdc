import React, { useContext, useState } from "react";
import { RouteContext } from "../context/RouteContext";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";  // Import useNavigate

const AllRoutes = () => {
  const { routes, addRoute, updateRoute, deleteRoute } = useContext(RouteContext);
  const navigate = useNavigate(); // Initialize navigate

  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newRoute, setNewRoute] = useState({
    origin: "",
    destination: "",
    distance: "",
    estimatedDuration: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoute({ ...newRoute, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdating) {
      updateRoute(selectedRoute.routeID, newRoute);
      setIsUpdating(false);
    } else {
      addRoute(newRoute);
    }
    setShowModal(false);
    setNewRoute({ origin: "", destination: "", distance: "", estimatedDuration: "" });
  };

  const handleUpdate = (route) => {
    setSelectedRoute(route);
    setNewRoute(route);
    setIsUpdating(true);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-6 bg-neutral-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">Routes Management</h1>

      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded transition-all"
      >
        Back
      </Button>

      {/* Add Route Button */}
      <div className="mb-4 text-center">
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-all"
        >
          Add Route
        </Button>
      </div>

      {/* Routes Table */}
      <Table striped bordered hover className="table-auto w-full mt-4">
        <thead>
          <tr className="bg-indigo-100">
            <th className="px-4 py-2 text-left">Origin</th>
            <th className="px-4 py-2 text-left">Destination</th>
            <th className="px-4 py-2 text-left">Distance (km)</th>
            <th className="px-4 py-2 text-left">Estimated Duration (min)</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(routes) && routes.length > 0 ? (
            routes.map((route) => (
              route ? (  // Check if route is defined
                <tr key={route.routeID}>
                  <td className="px-4 py-2">{route.origin}</td>
                  <td className="px-4 py-2">{route.destination}</td>
                  <td className="px-4 py-2">{route.distance}</td>
                  <td className="px-4 py-2">{route.estimatedDuration}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="warning"
                      onClick={() => handleUpdate(route)}
                      className="px-4 py-2 text-white bg-yellow-400 hover:bg-yellow-500 rounded mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteRoute(route.routeID)}
                      className="px-4 py-2 text-white bg-red-400 hover:bg-red-500 rounded"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ) : null // Skip undefined routes
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-4">No routes available</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for Adding or Updating Routes */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isUpdating ? "Update Route" : "Add New Route"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="text-gray-600">Origin</Form.Label>
              <Form.Control
                type="text"
                name="origin"
                value={newRoute.origin}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-gray-600">Destination</Form.Label>
              <Form.Control
                type="text"
                name="destination"
                value={newRoute.destination}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-gray-600">Distance (km)</Form.Label>
              <Form.Control
                type="number"
                name="distance"
                value={newRoute.distance}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-gray-600">Estimated Duration (min)</Form.Label>
              <Form.Control
                type="number"
                name="estimatedDuration"
                value={newRoute.estimatedDuration}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </Form.Group>
            <div className="flex justify-center gap-4">
              <Button
                type="submit"
                variant="primary"
                className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-all"
              >
                {isUpdating ? "Update Route" : "Add Route"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AllRoutes;

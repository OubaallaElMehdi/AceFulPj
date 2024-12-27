"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, DirectionsRenderer } from "@react-google-maps/api";
import MapService from "@/services/MapService";

const MapTrajectory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [trajectories, setTrajectories] = useState([]);
    const [error, setError] = useState("");
    const [directions, setDirections] = useState([]); // Array of direction results

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const data = await MapService.getVehicles();
            setVehicles(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSearch = async () => {
        if (!selectedVehicle || !selectedDate) {
            setError("Please select a vehicle and a date.");
            return;
        }

        setError("");

        try {
            const data = await MapService.getTrajectoriesByCarAndDate(
                selectedVehicle,
                selectedDate
            );
            setTrajectories(data); // Array of { latitude, longitude }
            calculateRoutes(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const calculateRoutes = async (trajectoryPoints) => {
        if (trajectoryPoints.length < 2) {
            setError("Not enough points to calculate a route.");
            return;
        }

        const chunks = [];
        const chunkSize = 23; // 23 waypoints + origin + destination = 25
        for (let i = 0; i < trajectoryPoints.length; i += chunkSize) {
            chunks.push(trajectoryPoints.slice(i, i + chunkSize + 1));
        }

        const directionsService = new window.google.maps.DirectionsService();
        const results = [];

        for (const chunk of chunks) {
            const waypoints = chunk.slice(1, -1).map((point) => ({
                location: { lat: point.latitude, lng: point.longitude },
                stopover: false,
            }));

            const origin = { lat: chunk[0].latitude, lng: chunk[0].longitude };
            const destination = {
                lat: chunk[chunk.length - 1].latitude,
                lng: chunk[chunk.length - 1].longitude,
            };

            const response = await new Promise((resolve, reject) => {
                directionsService.route(
                    {
                        origin,
                        destination,
                        waypoints,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                        if (status === window.google.maps.DirectionsStatus.OK) {
                            resolve(result);
                        } else {
                            reject("Failed to fetch directions: " + status);
                        }
                    }
                );
            });

            results.push(response);
        }

        setDirections(results);
    };

    const mapContainerStyle = {
        height: "500px",
        width: "100%",
    };

    const center = trajectories.length
        ? { lat: trajectories[0].latitude, lng: trajectories[0].longitude }
        : { lat: 40.7128, lng: -74.006 }; // Default center if no data

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Map Trajectory Analysis</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Search Form */}
            <div className="form-group mb-4">
                <label htmlFor="vehicle">Select Vehicle:</label>
                <select
                    id="vehicle"
                    className="form-control"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    required
                >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group mb-4">
                <label htmlFor="date">Select Date:</label>
                <input
                    type="date"
                    id="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                />
            </div>
            <button className="btn btn-primary mb-4" onClick={handleSearch}>
                Search
            </button>

            {/* Map */}
            <LoadScript googleMapsApiKey="AIzaSyBqGDXVFu8z386xLHiQjIh6S1qP7kwEEB0">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                >
                    {/* Render Directions */}
                    {directions.map((direction, index) => (
                        <DirectionsRenderer key={index} directions={direction} />
                    ))}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default MapTrajectory;

"use client";

import { useEffect, useState } from "react";
import AnomalieService from "@/services/AnomalieService";

const convertDateToTimestamp = (date) => {
    // Converts a JavaScript Date object to a Unix timestamp (in seconds)
    return Math.floor(date.getTime() / 1000);
};

const AnomalyPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [anomalyData, setAnomalyData] = useState({
        latitude: "",
        longitude: "",
        speed: "",
        heading: "",
        start_time: "",
    });
    const [jsonInput, setJsonInput] = useState(""); // JSON input for alternative mode
    const [inputMode, setInputMode] = useState("form"); // 'form' or 'json'
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const data = await AnomalieService.getAllVehicles();
            setVehicles(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResult(null);

        let payload;

        if (inputMode === "json") {
            try {
                payload = JSON.parse(jsonInput); // Parse the JSON input
            } catch (err) {
                setError("Invalid JSON format. Please fix and try again.");
                return;
            }
        } else {
            if (!selectedVehicle) {
                setError("Please select a vehicle.");
                return;
            }

            // Convert start time to timestamp
            const startTime = convertDateToTimestamp(new Date(anomalyData.start_time));
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const timeDiff = currentTime - startTime;

            // Prepare payload from the form data
            payload = {
                car_id: selectedVehicle,
                latitude: parseFloat(anomalyData.latitude),
                longitude: parseFloat(anomalyData.longitude),
                speed: parseFloat(anomalyData.speed),
                heading: parseFloat(anomalyData.heading),
                time_diff: timeDiff,
                timestamp: currentTime,
            };
        }

        try {
            const data = await AnomalieService.analyzeAnomaly(payload);
            setResult(data);

            // Smooth scroll to the result
            document.getElementById("result").scrollIntoView({ behavior: "smooth" });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Anomaly Detection</h1>

            {error && <div className="alert alert-danger">{error}</div>}
            {result && (
                <div id="result" className="alert alert-info">
                    <h4>Analysis Result</h4>
                    <p><strong>Is Anomaly:</strong> {result.details.is_anomaly ? "Yes" : "No"}</p>
                    <p><strong>Anomaly Types:</strong> {result.anomaly_types.join(", ")}</p>
                    <p><strong>Timestamp:</strong> {new Date(result.details.timestamp * 1000).toLocaleString()}</p>
                    <p><strong>Time Difference:</strong> {result.details.time_diff} seconds</p>
                    <p><strong>Latitude:</strong> {result.details.latitude}</p>
                    <p><strong>Longitude:</strong> {result.details.longitude}</p>
                    <p><strong>Speed:</strong> {result.details.speed} km/h</p>
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">Input Mode:</label>
                <select
                    className="form-select"
                    value={inputMode}
                    onChange={(e) => setInputMode(e.target.value)}
                >
                    <option value="form">Form</option>
                    <option value="json">JSON</option>
                </select>
            </div>

            {inputMode === "form" ? (
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div className="form-group">
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

                    <div className="form-group">
                        <label htmlFor="latitude">Latitude:</label>
                        <input
                            type="number"
                            step="0.0001"
                            id="latitude"
                            value={anomalyData.latitude}
                            onChange={(e) => setAnomalyData({ ...anomalyData, latitude: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="longitude">Longitude:</label>
                        <input
                            type="number"
                            step="0.0001"
                            id="longitude"
                            value={anomalyData.longitude}
                            onChange={(e) => setAnomalyData({ ...anomalyData, longitude: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="speed">Speed:</label>
                        <input
                            type="number"
                            id="speed"
                            value={anomalyData.speed}
                            onChange={(e) => setAnomalyData({ ...anomalyData, speed: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="heading">Heading:</label>
                        <input
                            type="number"
                            id="heading"
                            value={anomalyData.heading}
                            onChange={(e) => setAnomalyData({ ...anomalyData, heading: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="start_time">Start Time:</label>
                        <input
                            type="datetime-local"
                            id="start_time"
                            value={anomalyData.start_time}
                            onChange={(e) => setAnomalyData({ ...anomalyData, start_time: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Analyze</button>
                </form>
            ) : (
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div className="form-group">
                        <label htmlFor="jsonInput">JSON Input:</label>
                        <textarea
                            id="jsonInput"
                            className="form-control"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder={`{
    "car_id": 1,
    "latitude": 40.7105988,
    "longitude": -74.0026257,
    "speed": 55.50382817023897,
    "heading": 136,
    "time_diff": 10,
    "timestamp": 1703689200
}`}
                            rows="8"
                            style={{ resize: "none" }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Analyze</button>
                </form>
            )}
        </div>
    );
};

export default AnomalyPage;
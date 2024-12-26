import os
import pandas as pd
import numpy as np
import joblib
import requests
from flask import Flask, jsonify, request
import tensorflow as tf
import logging
import geopy.distance

# Flask app
app = Flask(__name__)

# Constants
MODEL_DIR = "anomaly_detection/models"
MODEL_PATH = os.path.join(MODEL_DIR, "autoencoder_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
THRESHOLD_PATH = os.path.join(MODEL_DIR, "threshold.pkl")

# Load Keras model, scaler, and threshold
autoencoder = tf.keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
threshold = joblib.load(THRESHOLD_PATH)

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# In-memory storage for previous locations
previous_locations = {}  # Format: {car_id: (latitude, longitude)}

# Helper function to calculate distance between two GPS points
def calculate_distance(lat1, lon1, lat2, lon2):
    coords_1 = (lat1, lon1)
    coords_2 = (lat2, lon2)
    return geopy.distance.distance(coords_1, coords_2).km

# Helper function to classify anomaly type
def classify_anomaly(row, threshold, prev_lat=None, prev_lon=None):
    anomalies = []

    # Reconstruction error anomaly
    if row['reconstruction_error'] > threshold:
        anomalies.append("Reconstruction Error Anomaly")

    # Speed anomaly
    if row['speed'] > 100:  # Example speed limit
        anomalies.append("Speed Anomaly")

    # Time difference anomaly
    if row['time_diff'] > 60:  # Example time gap anomaly
        anomalies.append("Time Gap Anomaly")

    # Heading anomaly
    if abs(row['heading']) > 180:  # Example heading anomaly
        anomalies.append("Heading Anomaly")

    # Latitude/Longitude range check
    if row['latitude'] < -90 or row['latitude'] > 90:
        anomalies.append("Latitude Range Anomaly")
    if row['longitude'] < -180 or row['longitude'] > 180:
        anomalies.append("Longitude Range Anomaly")

    # Location change anomaly
    if prev_lat is not None and prev_lon is not None:
        distance = calculate_distance(prev_lat, prev_lon, row['latitude'], row['longitude'])
        if distance > 10:  # Example: Distance greater than 10 km in one time_diff
            anomalies.append("Location Change Anomaly")

    if not anomalies:
        anomalies.append("No Specific Anomaly Detected")

    return anomalies

# Fetch all valid car IDs
def fetch_all_car_ids():
    try:
        response = requests.get("http://localhost:8081/vehicles/all")  # Replace with your vehicle service endpoint
        if response.status_code == 200:
            car_ids = [int(vehicle['id']) for vehicle in response.json()]
            logging.info(f"Fetched car IDs: {car_ids}")
            return car_ids
        else:
            logging.error(f"Failed to fetch car IDs: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        logging.error(f"Error fetching car IDs: {e}")
        return []

# Route: Analyze live data
@app.route("/analyze", methods=["POST"])
def analyze_live_data():
    try:
        # Get JSON payload
        data = request.json
        required_fields = ['car_id', 'latitude', 'longitude', 'speed', 'heading', 'time_diff']

        # Validate input data
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Convert car_id to integer
        try:
            car_id = int(data['car_id'])
        except ValueError:
            return jsonify({"error": "Invalid car_id. It must be an integer."}), 400

        # Check if the car_id exists
        valid_car_ids = fetch_all_car_ids()
        if car_id not in valid_car_ids:
            return jsonify({
                "error": f"Car ID {car_id} does not exist in the system. Please provide a valid car ID."
            }), 400

        # Get previous location for this car
        prev_lat, prev_lon = previous_locations.get(car_id, (None, None))

        # Convert to DataFrame
        df_live = pd.DataFrame([data])
        df_live['vehicle_id'] = car_id

        # Preprocess the data
        model_features = ['latitude', 'longitude', 'speed', 'heading', 'time_diff']
        if 'vehicle_id' in scaler.feature_names_in_:
            model_features.append('vehicle_id')

        scaled_data = scaler.transform(df_live[model_features])

        # Predict reconstruction error
        predictions = autoencoder.predict(scaled_data)
        reconstruction_error = np.mean(np.square(predictions - scaled_data), axis=1)

        df_live['reconstruction_error'] = reconstruction_error
        df_live['is_anomaly'] = reconstruction_error > threshold

        # Classify anomalies
        if df_live['is_anomaly'].iloc[0]:
            anomaly_types = classify_anomaly(df_live.iloc[0], threshold, prev_lat, prev_lon)
            result = {
                "car_id": car_id,
                "is_anomaly": True,
                "anomaly_types": anomaly_types,
                "details": df_live.iloc[0].to_dict()
            }

            # Update previous location
            previous_locations[car_id] = (data['latitude'], data['longitude'])

            # Log and return anomaly details
            logging.info(f"Anomaly detected: {result}")
            return jsonify(result), 200
        else:
            # Update previous location if no anomaly
            previous_locations[car_id] = (data['latitude'], data['longitude'])
            return jsonify({
                "car_id": car_id,
                "is_anomaly": False,
                "message": "No anomaly detected."
            }), 200
    except Exception as e:
        logging.error(f"Error in /analyze endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

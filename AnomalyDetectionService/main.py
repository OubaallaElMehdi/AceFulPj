import os
import pandas as pd
import numpy as np
import joblib
import requests
import random
import time
import logging
import tensorflow as tf
import geopy.distance
from flask import Flask, jsonify, request, Response
from py_eureka_client import eureka_client

# Flask app
app = Flask(__name__)

# Eureka configuration
EUREKA_SERVER = "http://ace-eureka:8761/eureka/"
EUREKA_APP_NAME = "ANOMALY-DETECTION-SERVICE"
INSTANCE_HOST = "192.168.1.2"  # Accessible IP
INSTANCE_PORT = 5000  # Flask port

# Initialize Eureka client
eureka_client.init(
    eureka_server=EUREKA_SERVER,
    app_name=EUREKA_APP_NAME,
    instance_port=INSTANCE_PORT,
    instance_ip=INSTANCE_HOST,
    region="default"
)
logging.info(f"Registered service {EUREKA_APP_NAME} with Eureka")

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


# Helper function: Calculate distance between two GPS points
def calculate_distance(lat1, lon1, lat2, lon2):
    coords_1 = (lat1, lon1)
    coords_2 = (lat2, lon2)
    return geopy.distance.distance(coords_1, coords_2).km


# Helper function: Classify anomaly type
def classify_anomaly(row, threshold, prev_lat=None, prev_lon=None):
    anomalies = []

    # Reconstruction error anomaly
    if row['reconstruction_error'] > threshold:
        anomalies.append("Reconstruction Error Anomaly")

    # Speed anomaly
    if row['speed'] > 100:  # Example speed limit
        anomalies.append("Speed Anomaly")

    # Latitude/Longitude range check
    if row['latitude'] < -90 or row['latitude'] > 90:
        anomalies.append("Latitude Range Anomaly")
    if row['longitude'] < -180 or row['longitude'] > 180:
        anomalies.append("Longitude Range Anomaly")

    # Location change anomaly
    if prev_lat is not None and prev_lon is not None:
        distance = calculate_distance(prev_lat, prev_lon, row['latitude'], row['longitude'])
        if distance > 10:  # Example: Distance greater than 10 km in one second
            anomalies.append("Location Change Anomaly")

    if not anomalies:
        anomalies.append("No Specific Anomaly Detected")

    return anomalies


# Route: Analyze live data
@app.route("/analyze", methods=["POST"])
def analyze_live_data():
    try:
        # Get JSON payload
        data = request.json
        required_fields = ['latitude', 'longitude', 'speed', 'heading', 'time_diff']

        # Validate input data
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Convert to DataFrame
        df_live = pd.DataFrame([data])

        # Preprocess the data
        model_features = ['latitude', 'longitude', 'speed', 'heading', 'time_diff']
        scaled_data = scaler.transform(df_live[model_features])

        # Predict reconstruction error
        predictions = autoencoder.predict(scaled_data)
        reconstruction_error = np.mean(np.square(predictions - scaled_data), axis=1)

        df_live['reconstruction_error'] = reconstruction_error
        df_live['is_anomaly'] = reconstruction_error > threshold

        if df_live['is_anomaly'].iloc[0]:
            anomaly_types = classify_anomaly(df_live.iloc[0], threshold)
            result = {
                "is_anomaly": True,
                "anomaly_types": anomaly_types,
                "details": df_live.iloc[0].to_dict()
            }
            return jsonify(result), 200
        else:
            return jsonify({"is_anomaly": False, "message": "No anomaly detected."}), 200
    except Exception as e:
        logging.error(f"Error in /analyze endpoint: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

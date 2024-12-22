import os
import pandas as pd
import numpy as np
import joblib
from flask import Flask, jsonify, request
import tensorflow as tf

# Flask app
app = Flask(__name__)

# Constants
MODEL_DIR = "anomaly_detection/models"
MODEL_PATH = os.path.join(MODEL_DIR, "autoencoder_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
THRESHOLD_PATH = os.path.join(MODEL_DIR, "threshold.pkl")

# Verify required files
missing_files = []
if not os.path.exists(MODEL_PATH):
    missing_files.append("autoencoder_model.keras")
if not os.path.exists(SCALER_PATH):
    missing_files.append("scaler.pkl")
if not os.path.exists(THRESHOLD_PATH):
    missing_files.append("threshold.pkl")

if missing_files:
    raise FileNotFoundError(f"Missing required files: {', '.join(missing_files)}. Please train the model first.")

# Load Keras model, scaler, and threshold
autoencoder = tf.keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
threshold = joblib.load(THRESHOLD_PATH)

# Helper function to classify anomaly type
def classify_anomaly(row, threshold):
    anomalies = []
    if row['reconstruction_error'] > threshold:
        if row['speed'] > 100:  # Example speed limit
            anomalies.append("Speed Anomaly")
        if row['time_diff'] > 60:  # Example time gap anomaly
            anomalies.append("Time Anomaly")
        if abs(row['heading']) > 180:  # Example heading anomaly
            anomalies.append("Heading Anomaly")
        if not anomalies:
            anomalies.append("Unknown Anomaly")
    return anomalies

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

        # Extract car_id for logging or future use
        car_id = data['car_id']

        # Convert to DataFrame
        df_live = pd.DataFrame([data])
        df_live.drop(columns=['car_id'], inplace=True)  # Drop car_id for model input

        # Preprocess the data
        scaled_data = scaler.transform(df_live[['latitude', 'longitude', 'speed', 'heading', 'time_diff']])

        # Predict reconstruction error
        predictions = autoencoder.predict(scaled_data)
        reconstruction_error = np.mean(np.square(predictions - scaled_data), axis=1)

        df_live['reconstruction_error'] = reconstruction_error
        df_live['is_anomaly'] = reconstruction_error > threshold

        # Classify anomalies
        if df_live['is_anomaly'].iloc[0]:
            anomaly_types = classify_anomaly(df_live.iloc[0], threshold)
            return jsonify({
                "car_id": car_id,
                "is_anomaly": True,
                "anomaly_types": anomaly_types,
                "details": df_live.iloc[0].to_dict()
            }), 200
        else:
            return jsonify({
                "car_id": car_id,
                "is_anomaly": False,
                "message": "No anomaly detected."
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

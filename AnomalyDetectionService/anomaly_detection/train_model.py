import requests
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

# Constants
VEHICLE_SERVICE_URL = "http://localhost:8081/api/trajectories/vehicle"
MODEL_DIR = "anomaly_detection/models"

# Create directory if not exists
def create_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)

# Fetch trajectory data
def fetch_data(vehicle_ids):
    all_data = []
    for vehicle_id in vehicle_ids:
        response = requests.get(f"{VEHICLE_SERVICE_URL}/{vehicle_id}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                all_data.extend(data)
    return pd.DataFrame(all_data)

# Preprocess data
def preprocess_data(df):
    required_fields = ['latitude', 'longitude', 'speed', 'heading', 'timestamp']
    print(f"Initial DataFrame shape: {df.shape}")
    print("Sample data before preprocessing:")
    print(df.head())

    # Check for missing required fields
    for field in required_fields:
        if field not in df.columns:
            raise ValueError(f"Missing field: {field}")

    # Convert timestamp column to datetime
    try:
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
        print("Timestamp conversion successful.")
    except Exception as e:
        print(f"Error converting timestamp: {e}")
        raise

    # Identify and drop rows with invalid timestamps
    invalid_timestamps = df[df['timestamp'].isna()]
    print(f"Rows with invalid timestamps:\n{invalid_timestamps}")
    df = df.dropna(subset=['timestamp'])
    print(f"Rows dropped due to invalid timestamps: {invalid_timestamps.shape[0]}")
    print(f"Shape after timestamp validation: {df.shape}")

    # Calculate time difference in seconds
    df['time_diff'] = df['timestamp'].diff().dt.total_seconds()
    df['time_diff'] = df['time_diff'].fillna(0)  # Replace NaN caused by diff()

    # Ensure numeric fields are valid
    numeric_fields = ['latitude', 'longitude', 'speed', 'heading', 'time_diff']
    for field in numeric_fields:
        df[field] = pd.to_numeric(df[field], errors='coerce')

    # Drop rows with NaN in numeric fields
    before_dropna = df.shape[0]
    df = df.dropna(subset=numeric_fields)
    print(f"Rows dropped during numeric validation: {before_dropna - df.shape[0]}")
    print(f"Shape after numeric validation: {df.shape}")

    # Fill missing numeric fields with default values (e.g., 0)
    df[numeric_fields] = df[numeric_fields].fillna(0)

    print(f"Sample data after numeric field validation:")
    print(df.head())

    # Check if DataFrame is empty after preprocessing
    if df.empty:
        raise ValueError("No valid data remains after preprocessing.")

    # Standardize data
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df[numeric_fields])
    print(f"Final shape of scaled data: {scaled_data.shape}")

    return df, scaled_data, scaler

# Build Autoencoder
def build_autoencoder(input_dim):
    input_layer = Input(shape=(input_dim,))
    encoded = Dense(128, activation='relu')(input_layer)
    encoded = Dropout(0.2)(encoded)
    encoded = Dense(64, activation='relu')(encoded)
    bottleneck = Dense(32, activation='relu')(encoded)

    decoded = Dense(64, activation='relu')(bottleneck)
    decoded = Dense(128, activation='relu')(decoded)
    output_layer = Dense(input_dim, activation='linear')(decoded)

    autoencoder = Model(inputs=input_layer, outputs=output_layer)
    autoencoder.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    return autoencoder

# Train model and save
def train_autoencoder(train_data, val_data):
    input_dim = train_data.shape[1]
    autoencoder = build_autoencoder(input_dim)

    history = autoencoder.fit(
        train_data, train_data,
        epochs=50,
        batch_size=64,
        validation_data=(val_data, val_data),
        verbose=2
    )
    return autoencoder, history

# Plot training and validation loss
def plot_loss(history):
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.title('Autoencoder Training and Validation Loss')
    plt.legend()
    plt.savefig("training_validation_loss.png")
    plt.close()

def calculate_reconstruction_error(model, data):
    predictions = model.predict(data)
    mse = np.mean(np.square(data - predictions), axis=1)  # Mean Squared Error
    return mse

def detect_anomalies(live_data, model_path, scaler_path, threshold_path):
    # Load model, scaler, and threshold
    autoencoder = tf.keras.models.load_model(model_path)
    scaler = joblib.load(scaler_path)
    threshold = joblib.load(threshold_path)

    # Preprocess live data
    df_live = pd.DataFrame(live_data)
    required_fields = ['latitude', 'longitude', 'speed', 'heading', 'time_diff']
    df_live = df_live[required_fields].fillna(0)
    scaled_data = scaler.transform(df_live)

    # Calculate reconstruction errors
    reconstruction_errors = calculate_reconstruction_error(autoencoder, scaled_data)
    anomalies = reconstruction_errors > threshold

    # Append anomaly status to data
    df_live['reconstruction_error'] = reconstruction_errors
    df_live['is_anomaly'] = anomalies
    return df_live

# Main Function
def main():
    vehicle_ids = [1, 2]
    print("Fetching data...")
    df = fetch_data(vehicle_ids)
    print(f"Fetched DataFrame shape: {df.shape}")
    if df.empty:
        print("No data fetched.")
        return

    # Preprocess
    print("Preprocessing data...")
    try:
        df, scaled_data, scaler = preprocess_data(df)
    except ValueError as e:
        print(f"Error during preprocessing: {e}")
        return

    create_directory(MODEL_DIR)
    joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")

    # Split data
    if scaled_data.shape[0] == 0:
        print("No valid data available after preprocessing.")
        return

    train_data, test_data = train_test_split(scaled_data, test_size=0.2, random_state=42)
    train_data, val_data = train_test_split(train_data, test_size=0.2, random_state=42)

    # Train Autoencoder
    print("Training Autoencoder...")
    autoencoder, history = train_autoencoder(train_data, val_data)

    # Save the model
    autoencoder.save(f"{MODEL_DIR}/autoencoder_model.keras", save_format="keras")
    print("Autoencoder model saved.")

    # Plot Loss
    plot_loss(history)
    print("Training and validation loss plot saved.")

    # Calculate reconstruction error threshold
    print("Calculating reconstruction error threshold...")
    reconstruction_errors = calculate_reconstruction_error(autoencoder, train_data)
    threshold = np.percentile(reconstruction_errors, 95)  # Set threshold at 95th percentile
    joblib.dump(threshold, f"{MODEL_DIR}/threshold.pkl")
    print(f"Reconstruction error threshold saved: {threshold:.4f}")

    # Test Anomaly Detection on Test Data
    test_errors = calculate_reconstruction_error(autoencoder, test_data)
    anomalies = test_errors > threshold
    print(f"Anomalies detected in test data: {np.sum(anomalies)} out of {len(test_data)}")

    # Simulate live data
    live_data = [
        {"latitude": 40.7128, "longitude": -74.0060, "speed": 50, "heading": 180, "time_diff": 10},
        {"latitude": 40.7306, "longitude": -73.9352, "speed": 120, "heading": 200, "time_diff": 5},  # Anomaly
    ]

    # Detect anomalies in live data
    print("Detecting anomalies in live data...")
    result = detect_anomalies(live_data, f"{MODEL_DIR}/autoencoder_model.keras", f"{MODEL_DIR}/scaler.pkl", f"{MODEL_DIR}/threshold.pkl")
    print(result)

if __name__ == "__main__":
    main()

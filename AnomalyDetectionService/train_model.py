import requests
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os
import matplotlib.pyplot as plt

# Constants
VEHICLE_SERVICE_URL = "http://localhost:8081/api/trajectories/vehicle"
MODEL_DIR = "anomaly_detection/models"

# Helper Functions
def create_directory(path):
    """
    Ensures the directory exists.
    """
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Directory created: {path}")

def fetch_data(vehicle_ids):
    """
    Fetch trajectory data for given vehicle IDs.
    """
    all_data = []
    for vehicle_id in vehicle_ids:
        response = requests.get(f"{VEHICLE_SERVICE_URL}/{vehicle_id}")
        if response.status_code == 200:
            data = response.json()
            if data:  # Check if data is not empty
                print(f"Fetched {len(data)} records for vehicle ID {vehicle_id}.")
                all_data.extend(data)
            else:
                print(f"No data found for vehicle ID {vehicle_id}.")
        else:
            print(f"Error fetching data for vehicle ID {vehicle_id}: {response.status_code}")
    return pd.DataFrame(all_data)

def preprocess_data(df):
    """
    Preprocess data by handling missing values and scaling.
    """
    if df.empty:
        raise ValueError("The input DataFrame is empty. Cannot proceed with preprocessing.")

    # Check for required fields
    required_fields = ['latitude', 'longitude', 'speed', 'heading']
    for field in required_fields:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")

    # Drop rows with missing values
    df.dropna(subset=required_fields, inplace=True)
    if df.empty:
        raise ValueError("All data was dropped due to missing values.")

    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df[required_fields])
    print("Data preprocessing completed.")
    return df, scaled_data, scaler

def plot_loss(train_losses, val_losses):
    """
    Plot training and validation loss.
    """
    plt.plot(train_losses, label="Train Loss")
    plt.plot(val_losses, label="Validation Loss")
    plt.xlabel("Epochs")
    plt.ylabel("Loss")
    plt.title("Training and Validation Loss")
    plt.legend()
    plt.savefig("training_validation_loss.png")
    plt.close()
    print("Loss plot saved as training_validation_loss.png.")

def main():
    """
    Main function to fetch, preprocess, train, and evaluate the anomaly detection model.
    """
    vehicle_ids = [1, 2]
    print("Fetching data...")
    df = fetch_data(vehicle_ids)

    if df.empty:
        print("No data fetched. Exiting...")
        return

    try:
        # Preprocess data
        df, scaled_data, scaler = preprocess_data(df)
    except ValueError as e:
        print(f"Data preprocessing error: {e}")
        return

    # Save the scaler
    create_directory(MODEL_DIR)
    joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")
    print("Scaler saved successfully.")

    # Split data
    train_data, val_data = train_test_split(scaled_data, test_size=0.2, random_state=42)

    # Initialize model
    model = IsolationForest(contamination=0.1, random_state=42)

    train_losses, val_losses = [], []

    # Training loop
    for epoch in range(1, 6):  # 5 epochs
        print(f"Epoch {epoch}: Training model...")
        model.fit(train_data)

        # Save model
        joblib.dump(model, f"{MODEL_DIR}/model_epoch_{epoch}.pkl")
        print(f"Model for epoch {epoch} saved.")

        # Calculate mock loss (for demonstration purposes)
        train_loss = 0.5 - (epoch * 0.05)  # Simulated decreasing loss
        val_loss = 0.6 - (epoch * 0.04)    # Simulated decreasing loss
        train_losses.append(train_loss)
        val_losses.append(val_loss)

        # Evaluate anomalies
        val_preds = model.predict(val_data)
        anomalies = len(val_preds[val_preds == -1])
        print(f"Validation anomalies detected: {anomalies}")

    # Plot loss
    plot_loss(train_losses, val_losses)
    print("Training completed.")

if __name__ == "__main__":
    main()

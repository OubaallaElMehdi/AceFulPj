# Use the official Python 3.10 slim image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the project files into the container
COPY . .

COPY ./anomaly_detection/models ./anomaly_detection/models

# Update and install system dependencies (optional but useful for compatibility)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*


COPY ./anomaly_detection/models ./anomaly_detection/models

# Install Python requirements (if you already have a requirements.txt)
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Install additional Python packages
RUN pip install pandas \
    && pip install joblib \
    && pip install flask \
    && pip install tensorflow \
    && pip install geopy \
    && pip install scikit-learn

# Expose the Flask app port
EXPOSE 5000

# Command to run the application
CMD ["python", "main.py"]

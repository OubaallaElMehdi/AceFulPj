# Base Image with Python 3.10
FROM python:3.10-slim

# Set Working Directory
WORKDIR /app

# Install system dependencies for TensorFlow and Scikit-learn
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libopenblas-dev \
    liblapack-dev \
    libatlas-base-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy Requirements File
COPY ./anomaly_detection/requirements.txt ./requirements.txt

# Install Python Dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the Application Code
COPY ./anomaly_detection ./anomaly_detection
COPY ./anomaly_detection/main.py ./main.py

# Expose Flask Application Port
EXPOSE 5000

# Run Flask Application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "main:app"]

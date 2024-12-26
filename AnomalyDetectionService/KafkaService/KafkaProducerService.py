from kafka import KafkaProducer
import json

class KafkaProducerService:
    def __init__(self, broker='kafka:9092', topic='anomaly-detection'):
        self.producer = KafkaProducer(
            bootstrap_servers=broker,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        )
        self.topic = topic

    def send_message(self, message):
        try:
            self.producer.send(self.topic, message)
            self.producer.flush()
            print(f"Message sent to topic '{self.topic}': {message}")
        except Exception as e:
            print(f"Error sending message to Kafka: {e}")

from kafka import KafkaConsumer
import json

class KafkaConsumerService:
    def __init__(self, broker='kafka:9092', topic='anomaly-detection', group_id='anomaly-group'):
        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers=broker,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id=group_id,
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )

    def consume_messages(self):
        try:
            for message in self.consumer:
                print(f"Received message: {message.value}")
        except Exception as e:
            print(f"Error consuming message from Kafka: {e}")

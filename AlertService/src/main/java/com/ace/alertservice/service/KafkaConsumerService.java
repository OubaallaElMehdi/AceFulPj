package com.ace.alertservice.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    @KafkaListener(topics = "example-topic", groupId = "{service_name}-group")
    public void listen(String message) {
        System.out.println("Received message: " + message);
    }
}
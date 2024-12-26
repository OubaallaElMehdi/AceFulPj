package com.ace.alertservice.ws;

import com.ace.alertservice.entity.Alert;
import com.ace.alertservice.service.AlertService;
import com.ace.alertservice.service.KafkaProducer;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    private final AlertService alertService;
    private final KafkaProducer kafkaProducer;

    public AlertController(AlertService alertService, KafkaProducer kafkaProducer) {
        this.alertService = alertService;
        this.kafkaProducer = kafkaProducer;
    }

    @GetMapping("/{vehicleId}")
    public List<Alert> getAlertsByVehicleId(@PathVariable Long vehicleId) {
        return alertService.getAlertsByVehicleId(vehicleId);
    }

    @PostMapping
    public Alert createAlert(@RequestParam Long vehicleId,
                             @RequestParam String anomalyType,
                             @RequestParam String details) {
        Alert alert = alertService.createAlert(vehicleId, anomalyType, details);

        // Publish to Kafka
        String message = String.format("VehicleID: %d, Anomaly: %s, Details: %s", vehicleId, anomalyType, details);
        kafkaProducer.sendMessage("alert-topic", message);

        return alert;
    }
}

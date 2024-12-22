package com.ace.alertservice.ws;

import com.ace.alertservice.entity.Alert;
import com.ace.alertservice.service.AlertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/{vehicleId}")
    public List<Alert> getAlertsByVehicleId(@PathVariable Long vehicleId) {
        return alertService.getAlertsByVehicleId(vehicleId);
    }

    @PostMapping
    public Alert createAlert(@RequestParam Long vehicleId,
                             @RequestParam String anomalyType,
                             @RequestParam String details) {
        return alertService.createAlert(vehicleId, anomalyType, details);
    }
}

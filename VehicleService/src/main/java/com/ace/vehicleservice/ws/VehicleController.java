package com.ace.vehicleservice.ws;

import com.ace.vehicleservice.dto.VehicleDTO;
import com.ace.vehicleservice.entity.Vehicle;
import com.ace.vehicleservice.service.VehicleService;
import com.ace.vehicleservice.service.KafkaProducerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {
    private final VehicleService vehicleService;
    private final KafkaProducerService kafkaProducerService;

    public VehicleController(VehicleService vehicleService, KafkaProducerService kafkaProducerService) {
        this.vehicleService = vehicleService;
        this.kafkaProducerService = kafkaProducerService;
    }

    @PostMapping
    public Vehicle createVehicle(@RequestBody Vehicle vehicle) {
        Vehicle createdVehicle = vehicleService.createVehicle(vehicle);

        // Send the created vehicle details to Kafka
        kafkaProducerService.sendMessage("vehicle-topic", createdVehicle);

        return createdVehicle;
    }


    @GetMapping
    public List<Vehicle> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.findAll();
        kafkaProducerService.sendMessage("vehicle-topic", "Fetched all vehicles");

        return vehicles;
    }

    @GetMapping("/all")
    public List<VehicleDTO> getAllVehicleId() {
        List<VehicleDTO> vehicleDTOs = vehicleService.findAll()
                .stream()
                .map(vehicle -> new VehicleDTO(vehicle.getId(), vehicle.getName()))
                .collect(Collectors.toList());

        // Send a message to Kafka (e.g., log the fetch operation)
        kafkaProducerService.sendMessage("vehicle-topic", "Fetched all vehicle IDs");

        return vehicleDTOs;
    }
}
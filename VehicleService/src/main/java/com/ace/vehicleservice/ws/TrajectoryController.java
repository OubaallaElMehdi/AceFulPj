package com.ace.vehicleservice.ws;

import com.ace.vehicleservice.entity.Trajectory;
import com.ace.vehicleservice.service.KafkaProducerService;
import com.ace.vehicleservice.service.TrajectoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trajectories")
public class TrajectoryController {

    @Autowired
    private TrajectoryService trajectoryService; // Injecting TrajectoryService

    @Autowired
    private KafkaProducerService kafkaProducerService; // Injecting KafkaProducerService

    // Fetch all trajectories for a specific vehicle
    @GetMapping("/vehicle/{vehicleId}")
    public List<Trajectory> getTrajectoriesByVehicle(@PathVariable Long vehicleId) {
        return trajectoryService.getTrajectoriesByVehicleId(vehicleId)
                .stream()
                .peek(trajectory -> trajectory.setVehicle(null)) // Avoid recursive nesting
                .collect(Collectors.toList());
    }

    @PostMapping("/trajectories")
    public ResponseEntity<Void> saveTrajectories(@RequestBody List<Trajectory> trajectories) {
        System.out.println("Received a batch of " + trajectories.size() + " trajectories.");
        trajectoryService.saveAll(trajectories); // Save all trajectories in one call

        // Publish each trajectory to a Kafka topic
        trajectories.forEach(trajectory ->
                kafkaProducerService.sendMessage("trajectory-topic", trajectory)
        );

        return ResponseEntity.ok().build();
    }
}

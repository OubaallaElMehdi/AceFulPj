package com.ace.vehicleservice.ws;

import com.ace.vehicleservice.entity.Trajectory;
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

    // Fetch all trajectories for a specific vehicle
    @GetMapping("/vehicle/{vehicleId}")
    public List<Trajectory> getTrajectoriesByVehicle(@PathVariable Long vehicleId) {
        return trajectoryService.getTrajectoriesByVehicleId(vehicleId)
                .stream()
                .peek(trajectory -> trajectory.setVehicle(null)) // Avoid recursive nesting
                .collect(Collectors.toList());
    }


//    // Add a trajectory
//    @PostMapping("/trajectories")
//    public Trajectory addTrajectory(@RequestBody Trajectory trajectory) {
//        System.out.println("Received trajectory: " + trajectory);
//        return trajectoryService.save(trajectory);
//    }
//    @PostMapping("/trajectories")
//    public ResponseEntity<Void> saveTrajectories(@RequestBody List<Trajectory> trajectories) {
//        System.out.println("Received trajectory: " + trajectories);
//        trajectoryService.saveAll(trajectories);
//        return ResponseEntity.ok().build();
//    }

    @PostMapping("/trajectories")
    public ResponseEntity<Void> saveTrajectories(@RequestBody List<Trajectory> trajectories) {
        System.out.println("Received a batch of " + trajectories.size() + " trajectories.");
        trajectoryService.saveAll(trajectories);  // Save all trajectories in one call
        return ResponseEntity.ok().build();
    }


}

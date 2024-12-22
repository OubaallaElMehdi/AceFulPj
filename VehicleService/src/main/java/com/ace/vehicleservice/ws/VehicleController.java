    package com.ace.vehicleservice.ws;

    import com.ace.vehicleservice.entity.Vehicle;
    import com.ace.vehicleservice.service.VehicleService;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/vehicles")
    public class VehicleController {
        private final VehicleService vehicleService;

        public VehicleController(VehicleService vehicleService) {
            this.vehicleService = vehicleService;
        }


        @PostMapping
        public Vehicle createVehicle(@RequestBody Vehicle vehicle) {
            return vehicleService.createVehicle(vehicle);
        }

        @GetMapping
        public List<Vehicle> getAllVehicles() {
            return vehicleService.findAll();
        }


    }

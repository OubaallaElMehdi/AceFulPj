package com.ace.vehicleservice.repository;

import com.ace.vehicleservice.entity.Trajectory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrajectoryRepository extends JpaRepository<Trajectory, Long> {
    List<Trajectory> findByVehicleId(Long vehicleId);
}

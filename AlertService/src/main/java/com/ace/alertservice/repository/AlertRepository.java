package com.ace.alertservice.repository;

import com.ace.alertservice.entity.Alert;
import jakarta.persistence.Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByVehicleId(Long vehicleId);
}

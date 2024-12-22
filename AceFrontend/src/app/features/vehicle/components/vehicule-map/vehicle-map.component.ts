import { Component, OnInit } from '@angular/core';
import { TrajectoryService, Trajectory } from '../../../../core/services/trajectory';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicle-map',
  templateUrl: './vehicle-map.component.html',
  styleUrls: ['./vehicle-map.component.css'],
})
export class VehicleMapComponent implements OnInit {
  vehicleId: number = 1;
  date: string = '';
  map!: L.Map; // Non-null assertion to avoid type error

  constructor(private trajectoryService: TrajectoryService) {}

  ngOnInit(): void {
    this.initializeMap();
    console.log('VehicleMapComponent loaded');
  }

  initializeMap(): void {
    this.map = L.map('map').setView([40.7128, -74.006], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  findCar(): void {
    if (!this.date) {
      alert('Please select a date!');
      return;
    }

    this.trajectoryService.getTrajectories(this.vehicleId, this.date).subscribe((data: Trajectory[]) => {
      // Clear existing markers/polylines
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          this.map.removeLayer(layer);
        }
      });

      if (data.length === 0) {
        alert('No trajectory data found for this vehicle and date.');
        return;
      }

      const coordinates: L.LatLngExpression[] = data.map((point) => [point.latitude, point.longitude]);

      // Draw polyline
      const polyline = L.polyline(coordinates, { color: 'blue' }).addTo(this.map);

      // Add markers
      data.forEach((point: Trajectory, index: number) => {
        L.marker([point.latitude, point.longitude])
          .addTo(this.map)
          .bindPopup(`Point ${index + 1}<br>Speed: ${point.speed.toFixed(2)} km/h`);
      });

      // Fit map to bounds
      this.map.fitBounds(polyline.getBounds());
    });
  }
}

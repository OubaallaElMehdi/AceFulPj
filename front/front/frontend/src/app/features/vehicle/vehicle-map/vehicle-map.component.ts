import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { TrajectoryService, Trajectory } from '../../../core/services/trajectory.service';

@Component({
  selector: 'app-vehicle-map',
  templateUrl: './vehicle-map.component.html'
})
export class VehicleMapComponent implements OnInit {
  vehicleId: number = 1;
  date: string = '';
  map!: L.Map;

  constructor(private trajectoryService: TrajectoryService) {}

  ngOnInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map('map').setView([40.7128, -74.006], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  findCar(): void {
    if (!this.date) {
      alert('Please select a date!');
      return;
    }

    this.trajectoryService.getTrajectories(this.vehicleId, this.date).subscribe((data: Trajectory[]) => {
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

      const polyline = L.polyline(coordinates, { color: 'blue' }).addTo(this.map);

      data.forEach((point: Trajectory, index: number) => {
        L.marker([point.latitude, point.longitude])
          .addTo(this.map)
          .bindPopup(`Point ${index + 1}<br>Speed: ${point.speed.toFixed(2)} km/h<br>Status: ${point.status}`);
      });

      this.map.fitBounds(polyline.getBounds());
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trajectory {
  latitude: number;
  longitude: number;
  speed: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrajectoryService {
  private apiUrl = 'http://localhost:8080/api/trajectories';

  constructor(private http: HttpClient) {}

  // For example: http://localhost:8080/api/trajectories/vehicle/1?date=2024-12-19
  getTrajectories(vehicleId: number, date: string): Observable<Trajectory[]> {
    return this.http.get<Trajectory[]>(`${this.apiUrl}/vehicle/${vehicleId}?date=${date}`);
  }
}

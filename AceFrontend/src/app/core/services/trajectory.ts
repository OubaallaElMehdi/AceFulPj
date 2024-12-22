// src/app/core/services/trajectory.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trajectory {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrajectoryService {
  private apiUrl = 'http://localhost:8080/api/trajectories';

  constructor(private http: HttpClient) {}

  getTrajectories(vehicleId: number, date: string): Observable<Trajectory[]> {
    return this.http.get<Trajectory[]>(`${this.apiUrl}/vehicle/${vehicleId}?date=${date}`);
  }
}

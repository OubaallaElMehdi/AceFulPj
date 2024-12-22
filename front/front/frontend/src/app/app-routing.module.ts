import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './features/vehicle/vehicle-list/vehicle-list.component';
import { VehicleMapComponent } from './features/vehicle/vehicle-map/vehicle-map.component';
import { VehicleDetailComponent } from './features/vehicle/vehicle-detail/vehicle-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'vehicles/list', pathMatch: 'full' },
  { path: 'vehicles/list', component: VehicleListComponent },
  { path: 'vehicles/map', component: VehicleMapComponent },
  { path: 'vehicles/detail', component: VehicleDetailComponent },
  { path: '**', redirectTo: 'vehicles/list' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleRoutingModule } from './vehicle-routing.module';
import { FormsModule } from '@angular/forms';
import { VehicleMapComponent } from './components/vehicule-map/vehicle-map.component';

@NgModule({
  declarations: [VehicleMapComponent],
  imports: [CommonModule, VehicleRoutingModule, FormsModule],
})
export class VehicleModule {}

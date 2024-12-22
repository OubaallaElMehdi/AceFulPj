import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';  // Important
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { VehicleMapComponent } from './features/vehicle/components/vehicule-map/vehicle-map.component';

@NgModule({
  declarations: [AppComponent, VehicleMapComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    // Define routes inline here. The root path '' loads VehicleMapComponent
    RouterModule.forRoot([
      { path: '', component: VehicleMapComponent },
      { path: '**', redirectTo: '' }
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

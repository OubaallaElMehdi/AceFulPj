import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { VehicleListComponent } from './features/vehicle/vehicle-list/vehicle-list.component';
import { VehicleMapComponent } from './features/vehicle/vehicle-map/vehicle-map.component';
import { VehicleDetailComponent } from './features/vehicle/vehicle-detail/vehicle-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    VehicleListComponent,
    VehicleMapComponent,
    VehicleDetailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
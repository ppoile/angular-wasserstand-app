import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { MeasurementService } from './measurement.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wasserstand-app';
  measurement = "(unknown)";

  constructor(private measurementService: MeasurementService) {
    this.subscribeMeasurement();
    console.log(`measurement: ${this.measurement}`);
  }

  subscribeMeasurement(): void {
    const observable = this.measurementService.getObservable();
    observable.subscribe(measurement => {
      console.log(`measurement: ${measurement}`);
      this.measurement = measurement.toString();
    });
  }
}

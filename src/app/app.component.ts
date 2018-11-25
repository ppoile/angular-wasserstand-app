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
    console.log(`measurement: ${this.measurement}`);
    this.subscribeMeasurement();
  }

  subscribeMeasurement(): void {
    const observer = {
      next: (measurement) => {
        this.measurement = measurement.toString();
      },
      error: (err) => console.error('Observer: got an error: ' + err),
      complete: () => console.log('Observer: got complete notification'),
    };
    const observable = this.measurementService.getObservable();
    observable.subscribe(observer);
  }
}

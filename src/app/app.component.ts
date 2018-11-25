import { Component } from '@angular/core';

import { Observable, timer } from 'rxjs';
import { MeasurementService } from './measurement.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wasserstand-app';
  referenceLevel = 438;
  levelWarning: boolean;
  measurement = '(unknown)';
  updateMeasurementTimeoutInMinutes = 5;
  milliSecondsPerMinute = 60 * 1000;

  constructor(private measurementService: MeasurementService) {
    console.log(`measurement: ${this.measurement}`);
    this.setupTimer();
  }

  subscribeMeasurement(): void {
    const observer = {
      next: (measurement) => {
        this.measurement = measurement.toString();
        this.updateLevelWarning();
      },
      error: (err) => console.error('Observer: got an error: ' + err),
      complete: () => console.log('Observer: got complete notification'),
    };
    const observable = this.measurementService.getObservable();
    observable.subscribe(observer);
  }

  updateLevelWarning(): void {
    this.levelWarning = +this.measurement >= this.referenceLevel;
    console.log(`levelWarning: ${this.levelWarning}`);
  }

  setupTimer(): void {
    const timeoutInMilliseconds = this.updateMeasurementTimeoutInMinutes * this.milliSecondsPerMinute;
    const updateTimer = timer(0, timeoutInMilliseconds);
    updateTimer.subscribe(timeoutCounter => {
      console.log(`timeout...(counter=${timeoutCounter})`);
      this.subscribeMeasurement();
    });
  }

  onUpdateMeasurement(): void {
    console.log('update...');
    this.subscribeMeasurement();
  }
}

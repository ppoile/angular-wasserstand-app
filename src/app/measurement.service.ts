import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  // https://swisshydroapi.bouni.de/api/v1/station/2082/parameters/level
  // url = "/hydrodaten-api/2082/parameters/level";
  url = '/assets/2082-parameters-level.json';

  constructor(private http: HttpClient) { }

  getObservable(): Observable<number> {
    return this.http.get(this.url)
      .pipe(map((json) => this.getMeasurementFromJson(json)));
  }

  getMeasurementFromJson(json) {
    console.log(`json: ${json}`);
    const measurement = +json['value'];
    console.log(`measurement: ${measurement}`);
    return measurement;
  }
}

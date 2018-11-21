import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { delay, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  // https://www.hydrodaten.admin.ch/de/2082.html
  url = "/hydrodaten-api/2082.html";
  // url = '/assets/2082.html';

  constructor(private http: HttpClient) { }

  getObservable() {
    var observable = this.http.get(this.url, {responseType: 'text'})
    observable.subscribe(
      (data) => { console.log(`data: ${data}`); },
      error => { console.log(`error: ${error}`); },
    );
    return this.getObservable2();
  }

  getObservable2() {
    const dummy = of(null);
    return dummy.pipe(
      mapTo(434.77),
      delay(1000));
  }
}

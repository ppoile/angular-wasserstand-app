import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  // https://www.hydrodaten.admin.ch/de/2082.html
  // url = "/hydrodaten-api/2082.html";
  url = '/assets/2082.html';

  constructor(private http: HttpClient) { }

  getObservable(): Observable<number> {
    const htmlObservable = this.http.get(this.url, {responseType: 'text'});
    return this.measurementFromHtmlObservable(htmlObservable);
  }

  measurementFromHtmlObservable = map(
    (html: string) => this.getMeasurementFromHtml(html));

  getMeasurementFromHtml(html: string) {
    console.log(`html: ${html}`);
    var measurement = +$('td', $.parseHTML(html)).first().text();
    console.log(`measurement: ${measurement}`);
    return measurement;
  };
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Appoitement } from '../../models/appoitement';

@Injectable({
  providedIn: 'root'
})
export class AppointementService {

  private matiereUrl = "http://localhost:8080/medico/appointment"
  constructor(
    private http: HttpClient
  ) { }
  public addAppoitement(appoitement: Appoitement):Observable<Appoitement> {
    return this.http.post<Appoitement>(`${this.matiereUrl}/add`,appoitement);
  }
  public getAllAppointment():Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(`${this.matiereUrl}`);
  }

  getAppById(id: number): Observable<Appoitement> {
    return this.http.get<Appoitement>(`${this.matiereUrl}/get/${id}`);
  }
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.matiereUrl}/delete/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Appoitement } from '../models/appoitement';
import { Observable } from 'rxjs';

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
}

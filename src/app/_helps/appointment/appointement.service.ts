import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appoitement } from '../../models/appoitement';

@Injectable({
  providedIn: 'root'
})
export class AppointementService {

  private matiereUrl = "http://localhost:8080/medico/appointment";

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer les headers avec le token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Ajouter un rendez-vous
  public addAppoitement(appoitement: Appoitement): Observable<Appoitement> {
    return this.http.post<Appoitement>(
      `${this.matiereUrl}/add`, 
      appoitement,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer tous les rendez-vous
  public getAllAppointment(): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      this.matiereUrl,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer un rendez-vous par ID
  getAppById(id: number): Observable<Appoitement> {
    return this.http.get<Appoitement>(
      `${this.matiereUrl}/get/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Supprimer un rendez-vous
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.matiereUrl}/delete/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les rendez-vous d'aujourd'hui
  public getTodayAppointments(): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      `${this.matiereUrl}/today`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les rendez-vous d'un médecin
  public getAppointmentsByDoctor(doctorId: number): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      `${this.matiereUrl}/doctor/${doctorId}`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les rendez-vous d'un patient
  public getAppointmentsByPatient(patientId: number): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      `${this.matiereUrl}/patient/${patientId}`,
      { headers: this.getHeaders() }
    );
  }

  // Mettre à jour un rendez-vous
  public updateAppointment(id: number, appoitement: Appoitement): Observable<Appoitement> {
    return this.http.put<Appoitement>(
      `${this.matiereUrl}/update/${id}`,
      appoitement,
      { headers: this.getHeaders() }
    );
  }
}
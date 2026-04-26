// document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface MedicalDocument {
    id?: string;
    name: string;
    url: string;
    uploadDate?: Date;
  }
  
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/medico/appointment';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  uploadDocument(file: File, appointmentId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('appointmentId', appointmentId.toString());
    
    return this.http.post(`${this.apiUrl}/upload-document`, formData, {
      headers: this.getHeaders()
    });
  }

  deleteDocument(appointmentId: number, documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${appointmentId}/document/${documentId}`, {
      headers: this.getHeaders()
    });
  }

  // Récupérer tous les documents d'un patient
  getAllPatientDocuments(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient/${patientId}/all-documents`, {
      headers: this.getHeaders()
    });
  }

  // document.service.ts
downloadDocument(appointmentId: number, documentId: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${appointmentId}/document/${documentId}/download`, {
    headers: this.getHeaders(),
    responseType: 'blob'
  });
}
  // Récupérer les documents d'un rendez-vous spécifique
  getAppointmentDocuments(appointmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${appointmentId}/medical-documents`, {
      headers: this.getHeaders()
    });
  }

  // Mettre à jour les documents d'un rendez-vous
  updateAppointmentDocuments(appointmentId: number, documents: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/medical-documents`, 
      { medicalDocuments: documents }, {
      headers: this.getHeaders()
    });
  }
}
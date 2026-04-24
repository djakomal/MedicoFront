// document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
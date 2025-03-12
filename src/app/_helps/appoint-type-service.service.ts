import { Injectable } from '@angular/core';
import { AppoitementType } from '../models/appoitementType';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointTypeServiceService {

   private matiereUrl = "http://localhost:8080/medico/type"
   constructor(
     private http: HttpClient
   ) { }
   public addAppoitementType(appoitement: AppoitementType):Observable<AppoitementType> {
     return this.http.post<AppoitementType>(`${this.matiereUrl}`,appoitement);
   }
   public getAllAppointmentType():Observable<AppoitementType[]> {
     return this.http.get<AppoitementType[]>(`${this.matiereUrl}`);
   }
 
   getAppById(id: number): Observable<AppoitementType> {
     return this.http.get<AppoitementType>(`${this.matiereUrl}/${id}`);
   }
}

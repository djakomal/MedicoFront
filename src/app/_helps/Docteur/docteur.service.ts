import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Docteur } from '../../models/docteur';
import { catchError, Observable } from 'rxjs';
import { Speciality } from '../../models/speciality';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class DocteurService {

    private matiereUrl = "http://localhost:8080/medico/docteurs";
    constructor(
      private http: HttpClient
    ) { 
      axios.defaults.headers.post['Content-Type'] = 'application/json';
    }

  getAllDocteurs(): Observable<Docteur[]> {
    return this.http.get<Docteur[]>(this.matiereUrl + '/all');
  }
}

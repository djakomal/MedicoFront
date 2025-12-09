import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appoitement } from '../../models/appoitement';
import { User } from '../../models/user';
import { Conseil } from '../../models/Conseil';

export interface DashboardStats {
    nombreAppoitementAujourdhui:number
  nombreRendezvousAujourdhui: number;
  nombrePatientsActifs: number;
  nombreConseilsPublies: number;
  tendanceRendezvous: number;
  tendancePatientsActifs: number;
  tendanceConseils: number;
  tendanceAppoitement: number;
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/medico/api';
  patients : User[] = [];

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer tous les rendez-vous
  getAllAppointment(): Observable<Appoitement[]> {
    const headers = this.getHeaders();
    return this.http.get<Appoitement[]>(`${this.baseUrl}`, { headers });
  }

  // Récupérer tous les patients
  getAllUser(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.baseUrl}/signup`, { headers });
  }

  // Calculer les statistiques du tableau de bord
  calculateDashboardStats(
    rendezVous: Appoitement[], 
    conseils: Conseil[], 
    patients: User[]
  ): DashboardStats {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filtrer les rendez-vous d'aujourd'hui
    const rendezVousAujourdhui = rendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.preferredDate);
      return rdvDate >= today && rdvDate < tomorrow;
    });

    // Filtrer les rendez-vous d'hier pour calculer la tendance
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const rendezVousHier = rendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.preferredDate);
      return rdvDate >= yesterday && rdvDate < today;
    });

    // Calculer les patients actifs du mois en cours
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const patientsAvecRdvCeMois = new Set(
      rendezVous
        .filter(rdv => new Date(rdv.preferredDate) >= firstDayOfMonth)
        .map(rdv => rdv.firstname)
    );

    // Calculer les patients actifs du mois dernier
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const patientsAvecRdvMoisDernier = new Set(
      rendezVous
        .filter(rdv => {
          const rdvDate = new Date(rdv.preferredDate);
          return rdvDate >= firstDayOfLastMonth && rdvDate <= lastDayOfLastMonth;
        })
        .map(rdv => rdv.firstname)
    );

    // Calculer les conseils de cette semaine
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const conseilsCetteSemaine = conseils.filter(conseil => {
      if (conseil.datePublication) {
        const datePublication = new Date(conseil.datePublication);
        return datePublication >= firstDayOfWeek;
      }
      return false;
    });

    return {
        nombreAppoitementAujourdhui:rendezVousAujourdhui.length,
      nombreRendezvousAujourdhui: rendezVousAujourdhui.length,
      nombrePatientsActifs: patientsAvecRdvCeMois.size,
      nombreConseilsPublies: conseils.length,
      tendanceRendezvous: rendezVousAujourdhui.length - rendezVousHier.length,
      tendancePatientsActifs: patientsAvecRdvCeMois.size - patientsAvecRdvMoisDernier.size,
        tendanceAppoitement: rendezVousAujourdhui.length - rendezVousHier.length,
      tendanceConseils: conseilsCetteSemaine.length
    };
  }

  // Filtrer les rendez-vous du jour
  getRendezVousAujourdhui(rendezVous: Appoitement[]): Appoitement[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return rendezVous
      .filter(rdv => {
        const rdvDate = new Date(rdv.preferredDate);
        return rdvDate >= today && rdvDate < tomorrow;
      })
      .sort((a, b) => {
        return new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
      });
  }

  // Filtrer les rendez-vous de la semaine
  getRendezVousSemaine(rendezVous: Appoitement[]): Appoitement[] {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);

    return rendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.preferredDate);
      return rdvDate >= firstDayOfWeek && rdvDate < lastDayOfWeek;
    });
  }
}
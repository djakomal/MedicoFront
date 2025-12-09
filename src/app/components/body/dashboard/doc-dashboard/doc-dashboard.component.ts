
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Conseil } from '../../../../models/Conseil';
import { User } from '../../../../models/user';
import { JwtService } from '../../../../_helps/jwt/jwt.service';
import { Appoitement } from '../../../../models/appoitement';
import { ConseilService } from '../../../../_helps/Docteur/Conseil/Conseil.service';
import { AppointementService } from '../../../../_helps/appointment/appointement.service';
import { DashboardService, DashboardStats } from '../../../../_helps/Dashboardservice/Dashboard.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterOutlet],
  standalone:true,
  templateUrl: './doc-dashboard.component.html',
  styleUrls: ['./doc-dashboard.component.css']
})
export class DocdashboardComponent implements OnInit {
  stats: DashboardStats = {
    nombreAppoitementAujourdhui: 0,
    nombrePatientsActifs: 0,
    nombreConseilsPublies: 0,
    tendanceAppoitement: 0,
    tendancePatientsActifs: 0,
    tendanceConseils: 0,
    nombreRendezvousAujourdhui: 0,
    tendanceRendezvous: 0
  };

  AppoitementAujourdhui: Appoitement[] = [];
  AppoitementSemaine: Appoitement[] = [];
  loading: boolean = true;
  error: string = '';

  // Données brutes
  allAppoitement: Appoitement[] = [];
  allConseils: Conseil[] = [];
  allPatients: User[] = [];

  // Dates de la semaine
  weekDays: { name: string; number: number; date: Date; isToday: boolean }[] = [];
rendezVousAujourdhui: any;

  constructor(
    private dashboardService: DashboardService,
    private conseilService: ConseilService,
    private AppoitementService: AppointementService,
    private patientService: JwtService

  ) { }

  ngOnInit(): void {
    this.initializeWeekDays();
    this.loadDashboardData();
  }

  initializeWeekDays(): void {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Ajuster pour commencer le lundi
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const dayIndex = date.getDay();
      this.weekDays.push({
        name: dayNames[dayIndex],
        number: date.getDate(),
        date: date,
        isToday: this.isSameDay(date, today)
      });
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';
    
    // Charger toutes les données en parallèle avec forkJoin
    // Utilisation des services spécifiques pour chaque entité
    forkJoin({
      Appoitement: this.AppoitementService.getAllAppointment(),
      conseils: this.conseilService.getConseilsPublies(),
      patients: this.patientService.getAllUser(),
    }).subscribe({
      next: (data) => {
        console.log('📊 Données reçues:', data);
        
        // Stocker les données brutes
        this.allAppoitement = data.Appoitement;
        this.allConseils = data.conseils;
        this.allPatients = data.patients;

        // Calculer les statistiques
        this.stats = this.dashboardService.calculateDashboardStats(
          data.Appoitement,
          data.conseils,
          data.patients
        );
        console.log('📈 Statistiques calculées:', this.stats);

        // Filtrer les rendez-vous d'aujourd'hui
        this.AppoitementAujourdhui = this.dashboardService.getRendezVousAujourdhui(data.Appoitement);
        console.log('📅 Rendez-vous aujourd\'hui:', this.AppoitementAujourdhui);

        // Filtrer les rendez-vous de la semaine
        this.AppoitementSemaine = this.dashboardService.getRendezVousAujourdhui(data.Appoitement);
        console.log('📅 Rendez-vous de la semaine:', this.AppoitementSemaine);

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.error = 'Erreur lors du chargement des données. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getPatientName(Appoitement: Appoitement): string {
    if (Appoitement.firstname && Appoitement.lastname) {
      return `${Appoitement.firstname} ${Appoitement.lastname}`;
    }
    return 'Patient inconnu';
  }

  getAppointmentType(Appoitement: Appoitement): string {
    if (Appoitement.appointmentType) {
      // Formater le type de rendez-vous (ex: GENERAL -> Consultation générale)
      const type = Appoitement.appointmentType;
      switch(type.toUpperCase()) {
        case 'GENERAL':
          return 'Consultation générale';
        case 'SUIVI':
          return 'Suivi médical';
        case 'SPECIALISE':
          return 'Consultation spécialisée';
        case 'URGENCE':
          return 'Urgence';
        default:
          return type;
      }
    }
    return 'Consultation générale';
  }

  getTrendIcon(trend: number): string {
    return trend >= 0 ? '↑' : '↓';
  }

  getTrendClass(trend: number): string {
    return trend >= 0 ? 'trend-positive' : 'trend-negative';
  }

  refreshData(): void {
    console.log('🔄 Actualisation des données...');
    this.loadDashboardData();
  }

  // Méthode pour obtenir le nombre de rendez-vous par jour de la semaine
  getAppoitementCountForDay(date: Date): number {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return this.AppoitementSemaine.filter(rdv => {
      const rdvDate = new Date(rdv.preferredDate);
      return rdvDate >= dayStart && rdvDate <= dayEnd;
    }).length;
  }
}
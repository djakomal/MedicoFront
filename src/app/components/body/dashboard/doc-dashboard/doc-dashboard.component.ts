import { JwtService } from './../../../../_helps/jwt/jwt.service';
import { Component, OnInit } from '@angular/core';
import { filter, forkJoin } from 'rxjs';
import { Conseil } from '../../../../models/Conseil';
import { Appoitement } from '../../../../models/appoitement';
import { ConseilService } from '../../../../_helps/Docteur/Conseil/Conseil.service';
import { AppointementService } from '../../../../_helps/appointment/appointement.service';
import { DashboardService, DashboardStats } from '../../../../_helps/Dashboardservice/Dashboard.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { WeekDay } from '../../../../models/week-day';

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
  userName: string = '';
  doctortype: string = '';
  AppoitementSemaine: Appoitement[] = [];
  loading: boolean = false;
  error: string = '';
  isDashboard: boolean = false;
  menuOpen: boolean = false;

  // Données brutes
  allAppointments: Appoitement[] = [];
  allConseils: Conseil[] = [];
  weekDays: WeekDay[] = [];

  // Dates de la semaine
  rendezVousAujourdhui: any;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private conseilService: ConseilService,
    private AppoitementService: AppointementService,
    private JwtService: JwtService

  ) { }

  ngOnInit(): void {
    this.initializeWeekDays();
    this.loadDashboardData();
    this.checkRoute(this.router.url);
    this.loadUserName();
    this.loadDoctorType();
    
    // Écouter les changements de route
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.url);
    });
  }


  checkRoute(url: string) {
    this.isDashboard = url === '/DocDash' || url.endsWith('/DocDash');
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

  loadDashboardData() {
    this.loading = true;
    this.error = '';

    // Charger les rendez-vous et les conseils en parallèle
    Promise.all([
      this.AppoitementService.getAllAppointment().toPromise(),
      this.conseilService.getAllConseils().toPromise()
    ])
    .then(([appointments, conseils]) => {
      this.allAppointments = appointments || [];
      this.allConseils = conseils || [];
      
      // Calculer les statistiques
      this.calculateStats();
      
      // Générer les jours de la semaine
      this.generateWeekDays();
      
      this.loading = false;
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données:', error);
      this.error = 'Erreur lors du chargement des données. Veuillez réessayer.';
      this.loading = false;
    });
  }

  calculateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Rendez-vous aujourd'hui
    this.AppoitementAujourdhui = this.allAppointments.filter(app => {
      const appDate = new Date(app.preferredDate);
      return appDate >= today && appDate < tomorrow;
    });
    this.stats.nombreAppoitementAujourdhui = this.AppoitementAujourdhui.length;

    // Rendez-vous hier
    const appointmentsYesterday = this.allAppointments.filter(app => {
      const appDate = new Date(app.preferredDate);
      return appDate >= yesterday && appDate < today;
    }).length;
    this.stats.tendanceAppoitement = this.stats.nombreAppoitementAujourdhui - appointmentsYesterday;

    // Patients actifs (nombre unique de patients avec rendez-vous ce mois)
    const patientsThisMonth = new Set(
      this.allAppointments
        .filter(app => new Date(app.preferredDate) >= lastMonth)
        .map(app => app.id)
        .filter(id => id !== undefined)
    );
    this.stats.nombrePatientsActifs = patientsThisMonth.size;

    // Tendance patients (exemple: +5 ce mois, à adapter selon vos besoins)
    this.stats.tendancePatientsActifs = 5; // À calculer selon votre logique

    // Conseils publiés (tous les conseils ou seulement les publiés selon votre modèle)
    this.stats.nombreConseilsPublies = this.allConseils.length;

    // Conseils créés cette semaine
    const conseilsThisWeek = this.allConseils.filter(conseil => {
      if (conseil.datePublication) {
        const conseilDate = new Date(conseil.datePublication);
        return conseilDate >= lastWeek;
      }
      return false;
    }).length;
    this.stats.tendanceConseils = conseilsThisWeek;
  }

  
  formatTime(date: string | Date): string {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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


  logout(): void {
    this.JwtService.removeToken();
    this.userName = '';
    this.menuOpen = false;
    this.router.navigateByUrl('/DocLogin');
  }

  
  /**
   * Obtenir le nombre de rendez-vous pour un jour spécifique
   */
  getAppoitementCountForDay(date: Date): number {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
  
    return this.AppoitementSemaine.filter(app => {
      if (app.preferredDate) {
        const appDate = new Date(app.preferredDate);
        return appDate >= dayStart && appDate <= dayEnd;
      }
      return false;
    }).length;
  }
  
  /**
   * Formater une date complète
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
}
/**
 * Obtenir le statut de l'appointment avec emoji
 */
getAppointmentStatus(appoitement: Appoitement): string {
  if (!appoitement.status) return '⏳ En attente';
  
  switch(appoitement.status.toUpperCase()) {
    case 'CONFIRMED':
    case 'CONFIRME':
      return '✅ Confirmé';
    case 'PENDING':
    case 'EN_ATTENTE':
      return '⏳ En attente';
    case 'CANCELLED':
    case 'ANNULE':
      return '❌ Annulé';
    case 'COMPLETED':
    case 'TERMINE':
      return '✔️ Terminé';
    default:
      return appoitement.status;
  }

}


generateWeekDays() {
  const today = new Date();
  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  this.weekDays = [];
  
  // Générer 7 jours à partir d'aujourd'hui
  for (let i = 0; i < 7; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    this.weekDays.push({
      name: daysOfWeek[day.getDay()],
      number: day.getDate(),
      date: day,
      isToday: this.isSameDay(day, today)
    });
  }
}


loadUserName(): void {
  const decodedToken = this.JwtService.getDecodedToken();
  this.userName = this.JwtService.getUserName() || '';
  
  if (this.userName.includes('@')) {
    this.userName = this.userName.split('@')[0];
  }
}

loadDoctorType():void{
  const decodedToken = this.JwtService.getDecodedToken();
  this.doctortype = this.JwtService.getDoctortype() || '';
  const doctorType = decodedToken ? decodedToken['doctorType'] : '';
  console.log('Type de médecin chargé :', doctorType);
}
}
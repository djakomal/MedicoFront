import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  patients: number;
  visites: number;
  consultations: number;
  recette: number;
}

interface Appointment {
  time: string;
  patientName: string;
  type: string;
}

interface docteur {
  nom: string;
  prenom: string;
  initiales: string;
  role: string;
}

@Component({
  selector: 'app-doc-dashboard',
  standalone: true,
  imports: [RouterModule,RouterModule,CommonModule,RouterLink],
  templateUrl: './doc-dashboard.component.html',
  styleUrl: './doc-dashboard.component.css',
})
export class DocDashboardComponent implements OnInit {
  stats: DashboardStats = {
    patients: 0,
    visites: 0,
    consultations: 0,
    recette: 0
  };

  appointments: Appointment[] = [];
  todayAppointmentsCount: number = 0;
  docteur: docteur = {
    nom: '',
    prenom: '',
    initiales: '',
    role: 'Médecin'
  };

  selectedDay: number = new Date().getDate();
  currentWeek: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadAppointments();
    this.loaddocteur();
    this.generateWeekDays();
  }

  loadDashboardData(): void {
    // Remplacez par votre endpoint API
    this.http.get<DashboardStats>('/api/dashboard/stats').subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Données de fallback pour le développement
        this.stats = {
          patients: 3,
          visites: 32,
          consultations: 4,
          recette: 36000
        };
      }
    });
  }

  loadAppointments(): void {
    const today = new Date().toISOString().split('T')[0];
    this.http.get<Appointment[]>(`/api/appointments?date=${today}`).subscribe({
      next: (data) => {
        this.appointments = data;
        this.todayAppointmentsCount = data.length;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        // Données de fallback
        this.appointments = [
          { time: '09:00', patientName: 'KOUAKOU Jean', type: 'Consultation générale' },
          { time: '14:30', patientName: 'ASSI Marie', type: 'Suivi' }
        ];
        this.todayAppointmentsCount = this.appointments.length;
      }
    });
  }

  loaddocteur(): void {
    this.http.get<docteur>('/api/doctor/profile').subscribe({
      next: (data) => {
        this.docteur = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des infos médecin:', error);
        // Données de fallback
        this.docteur = {
          nom: 'ABALO',
          prenom: 'Komi',
          initiales: 'A',
          role: 'Médecin'
        };
      }
    });
  }

  generateWeekDays(): void {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);

    this.currentWeek = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      this.currentWeek.push({
        name: this.getDayName(day.getDay()),
        number: day.getDate(),
        date: day,
        isToday: day.toDateString() === today.toDateString()
      });
    }
  }

  getDayName(dayIndex: number): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[dayIndex];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Fcfa';
  }

  selectDay(day: any): void {
    this.selectedDay = day.number;
    const dateStr = day.date.toISOString().split('T')[0];
    this.http.get<Appointment[]>(`/api/appointments?date=${dateStr}`).subscribe({
      next: (data) => {
        this.appointments = data;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }
}
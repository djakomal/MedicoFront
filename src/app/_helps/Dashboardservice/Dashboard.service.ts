import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appoitement } from '../../models/appoitement';
import { Conseil } from '../../models/Conseil';
import { User } from '../../models/user';

export interface DashboardStats {
  nombreAppoitementAujourdhui: number;
  nombrePatientsActifs: number;
  nombreConseilsPublies: number;
  tendanceAppoitement: number;
  tendancePatientsActifs: number;
  tendanceConseils: number;
  nombreRendezvousAujourdhui: number;
  tendanceRendezvous: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/medico/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Calculer les statistiques du tableau de bord
   * @param appoitements - Liste de tous les rendez-vous
   * @param conseils - Liste de tous les conseils publiés
   * @param patients - Liste de tous les patients/utilisateurs
   */
  calculateDashboardStats(
    appoitements: Appoitement[], 
    conseils: Conseil[], 
    patients: User[]
  ): DashboardStats {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ============================================
    // CALCUL DES RENDEZ-VOUS D'AUJOURD'HUI
    // ============================================
    const appoitementsAujourdhui = appoitements.filter(app => {
      if (app.preferredDate) {
        const appDate = new Date(app.preferredDate);
        return appDate >= today && appDate < tomorrow;
      }
      return false;
    });

    // ============================================
    // CALCUL DES RENDEZ-VOUS D'HIER (pour tendance)
    // ============================================
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const appoitementsHier = appoitements.filter(app => {
      if (app.preferredDate) {
        const appDate = new Date(app.preferredDate);
        return appDate >= yesterday && appDate < today;
      }
      return false;
    });

    // ============================================
    // CALCUL DES PATIENTS ACTIFS (avec RDV ce mois)
    // ============================================
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const patientsAvecRdvCeMois = new Set(
      appoitements
        .filter(app => {
          if (app.preferredDate) {
            return new Date(app.preferredDate) >= firstDayOfMonth;
          }
          return false;
        })
        .map(app => app.id) // Supposant que userId identifie le patient
        .filter(id => id !== undefined)
    );

    // ============================================
    // CALCUL DES PATIENTS ACTIFS MOIS DERNIER
    // ============================================
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const patientsAvecRdvMoisDernier = new Set(
      appoitements
        .filter(app => {
          if (app.preferredDate) {
            const appDate = new Date(app.preferredDate);
            return appDate >= firstDayOfLastMonth && appDate <= lastDayOfLastMonth;
          }
          return false;
        })
        .map(app => app.id)
        .filter(id => id !== undefined)
    );

    // ============================================
    // CALCUL DES CONSEILS - AVEC COMPARAISON SEMAINES
    // ============================================
    let tendanceConseils = 0;
    
    // Calculer le premier jour de cette semaine (lundi)
    const firstDayOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    firstDayOfWeek.setDate(today.getDate() + diff);
    firstDayOfWeek.setHours(0, 0, 0, 0);

    // Vérifier si dateCreation ou datePublication existe
    const hasDateCreation = conseils.length > 0 && (conseils[0].datePublication || conseils[0].datePublication);

    if (hasDateCreation) {
      // ===== OPTION 1: Avec dateCreation ou datePublication (RECOMMANDÉ) =====
      
      // Conseils créés cette semaine
      const conseilsCetteSemaine = conseils.filter(conseil => {
        const dateRef = conseil.datePublication || conseil.datePublication;
        if (dateRef) {
          const date = new Date(dateRef);
          return date >= firstDayOfWeek;
        }
        return false;
      });

      // Conseils créés la semaine dernière
      const firstDayOfLastWeek = new Date(firstDayOfWeek);
      firstDayOfLastWeek.setDate(firstDayOfWeek.getDate() - 7);
      
      const lastDayOfLastWeek = new Date(firstDayOfWeek);
      lastDayOfLastWeek.setDate(firstDayOfWeek.getDate() - 1);
      lastDayOfLastWeek.setHours(23, 59, 59, 999);

      const conseilsSemaineDerniere = conseils.filter(conseil => {
        const dateRef = conseil.datePublication || conseil.datePublication;
        if (dateRef) {
          const date = new Date(dateRef);
          return date >= firstDayOfLastWeek && date <= lastDayOfLastWeek;
        }
        return false;
      });

      tendanceConseils = conseilsCetteSemaine.length - conseilsSemaineDerniere.length;
      
      console.log('✅ Calcul avec dateCreation/datePublication:');
      console.log('   📅 Conseils créés cette semaine:', conseilsCetteSemaine.length);
      console.log('   📅 Conseils créés semaine dernière:', conseilsSemaineDerniere.length);
      console.log('   📈 Tendance:', tendanceConseils);
      
    } else if (conseils.length > 0) {
      // ===== OPTION 2: Sans date - Basé sur les IDs =====
      
      console.warn('⚠️ dateCreation/datePublication non disponible, calcul basé sur les IDs');
      
      // Trier par ID décroissant (les plus récents d'abord)
      const conseilsTries = [...conseils].sort((a, b) => (b.id || 0) - (a.id || 0));
      
      // Prendre les 7 derniers conseils comme "cette semaine"
      const nombreConseilsRecents = Math.min(7, conseilsTries.length);
      const conseilsCetteSemaine = conseilsTries.slice(0, nombreConseilsRecents);
      const conseilsSemaineDerniere = conseilsTries.slice(nombreConseilsRecents, nombreConseilsRecents * 2);
      
      tendanceConseils = conseilsCetteSemaine.length - conseilsSemaineDerniere.length;
      
      console.log('⚠️ Calcul approximatif basé sur IDs:');
      console.log('   📊 7 conseils les plus récents:', conseilsCetteSemaine.length);
      console.log('   📊 7 conseils précédents:', conseilsSemaineDerniere.length);
      console.log('   📈 Tendance:', tendanceConseils);
    }

    // ============================================
    // RETOUR DES STATISTIQUES
    // ============================================
    const stats: DashboardStats = {
      nombreAppoitementAujourdhui: appoitementsAujourdhui.length,
      nombreRendezvousAujourdhui: appoitementsAujourdhui.length, // Même valeur
      nombrePatientsActifs: patientsAvecRdvCeMois.size,
      nombreConseilsPublies: conseils.length, // ✅ Tous les conseils créés (publiés + brouillons)
      tendanceAppoitement: appoitementsAujourdhui.length - appoitementsHier.length,
      tendanceRendezvous: appoitementsAujourdhui.length - appoitementsHier.length, // Même valeur
      tendancePatientsActifs: patientsAvecRdvCeMois.size - patientsAvecRdvMoisDernier.size,
      tendanceConseils: tendanceConseils // ✅ Conseils créés cette semaine vs semaine dernière
    };

    console.log('📊 Statistiques finales:', stats);
    
    return stats;
  }

  /**
   * Filtrer les rendez-vous d'aujourd'hui
   */
  getRendezVousAujourdhui(appoitements: Appoitement[]): Appoitement[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appoitements
      .filter(app => {
        if (app.preferredDate) {
          const appDate = new Date(app.preferredDate);
          return appDate >= today && appDate < tomorrow;
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
        const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
        return dateA - dateB;
      });
  }

  /**
   * Filtrer les rendez-vous de la semaine
   */
  getRendezVousSemaine(appoitements: Appoitement[]): Appoitement[] {
    const today = new Date();
    
    // Premier jour de la semaine (lundi)
    const firstDayOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    firstDayOfWeek.setDate(today.getDate() + diff);
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    // Dernier jour de la semaine (dimanche)
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);

    return appoitements.filter(app => {
      if (app.preferredDate) {
        const appDate = new Date(app.preferredDate);
        return appDate >= firstDayOfWeek && appDate < lastDayOfWeek;
      }
      return false;
    });
  }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointementService } from '../../../../_helps/appointment/appointement.service';
import { JwtService } from '../../../../_helps/jwt/jwt.service';
import { Appoitement } from '../../../../models/appoitement';

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  genre: string;
  allergie: string;
  medicaments: string;
  nombreRdv: number;
  Documents:string;
  dernierRdv: string;
  statut: string;
  rendezVous: Appoitement[]; // ← tous les RDV du patient
}

@Component({
  selector: 'app-mes-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-patients.component.html',
  styleUrls: ['./mes-patients.component.css']
})
export class MesPatientsComponent implements OnInit {

  patients: Patient[] = [];
  patientsFiltres: Patient[] = [];
  isLoading = true;
  recherche = '';
  erreur = '';
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  
  showDocumentsModal: boolean = false;
  selectedPatientName: string = '';
  documentsList: any[] = [];
  hasSingleDocument: boolean = false;
  singleDocumentUrl: string = '';
  // Modal
  modalOuvert = false;
  patientSelectionne: Patient | null = null;
  rdvSelectionne: Appoitement | null = null;

  constructor(
    private appointementService: AppointementService,
    private jwtService: JwtService
  ) {}

  ngOnInit(): void {
    this.chargerPatients();
  }

  chargerPatients(): void {
    this.isLoading = true;
    this.erreur = '';

    this.appointementService.getAllAppointment().subscribe({
      next: (rdvs: Appoitement[]) => {
        this.patients = this.extrairePatients(rdvs);
        this.patientsFiltres = [...this.patients];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.erreur = 'Impossible de charger les patients.';
        this.isLoading = false;
      }
    });
  }

  private extrairePatients(rdvs: Appoitement[]): Patient[] {
    const map = new Map<string, Patient>();

    rdvs.forEach(rdv => {
      const cle = rdv.email || `${rdv.firstname}-${rdv.lastname}`;
      // Récupérer les documents
      let documents = 'Aucun';
      if (rdv.medicalDocuments) {
        try {
          const docs = JSON.parse(rdv.medicalDocuments);
          if (docs && docs.length > 0) {
            documents = rdv.medicalDocuments; // Garder le JSON pour affichage
          }
        } catch (e) {
          documents = rdv.medicalDocuments;
        }
      }
      if (map.has(cle)) {
        const existing = map.get(cle)!;
        existing.nombreRdv++;
        existing.rendezVous.push(rdv);
        if (rdv.preferredDate > existing.dernierRdv) {
          existing.dernierRdv = rdv.preferredDate;
          existing.statut = rdv.status;
        }
      } else {
        map.set(cle, {
          id: rdv.id,
          nom: rdv.lastname || '',
          prenom: rdv.firstname || '',
          email: rdv.email || '',
          telephone: rdv.phone || '',
          dateNaissance: rdv.birthdate || '',
          genre: rdv.gender || '',
          allergie: rdv.allergies || 'Aucune',
          medicaments: rdv.medications || 'Aucun',
          nombreRdv: 1,
          dernierRdv: rdv.preferredDate || '',
          statut: rdv.status || 'pending',
          rendezVous: [rdv],
          Documents:rdv.medicalDocuments||'Aucun'
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }

  // ── Modal ─────────────────────────────────────────
  ouvrirModal(patient: Patient): void {
    this.patientSelectionne = patient;
    this.rdvSelectionne = patient.rendezVous[0] ?? null;
    this.modalOuvert = true;
    document.body.style.overflow = 'hidden';
  }

  fermerModal(): void {
    this.modalOuvert = false;
    this.patientSelectionne = null;
    this.rdvSelectionne = null;
    document.body.style.overflow = '';
  }

  selectionnerRdv(rdv: Appoitement): void {
    this.rdvSelectionne = rdv;
  }

  fermerSiCliqueExterieur(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.fermerModal();
    }
  }

  // ── Utilitaires ───────────────────────────────────
  filtrer(): void {
    const terme = this.recherche.toLowerCase().trim();
    if (!terme) { this.patientsFiltres = [...this.patients]; return; }
    this.patientsFiltres = this.patients.filter(p =>
      p.nom.toLowerCase().includes(terme) ||
      p.prenom.toLowerCase().includes(terme) ||
      p.email.toLowerCase().includes(terme) ||
      p.telephone.includes(terme)
    );
  }

  getInitiales(prenom: string, nom: string): string {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  }

  getGenreLabel(genre: string): string {
    const labels: any = { male: 'Homme', female: 'Femme', other: 'Autre' };
    return labels[genre] || genre;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      pending: 'En attente', validated: 'Validé',
      rejected: 'Rejeté',   started: 'En cours'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      pending: 'statut-pending', validated: 'statut-validated',
      rejected: 'statut-rejected', started: 'statut-started'
    };
    return classes[statut] || '';
  }



  ouvrirDocumentsModal(patient: Patient): void {
   
    this.selectedPatientName = `${patient.prenom} ${patient.nom}`;
    
    // Réinitialiser
    this.documentsList = [];
    this.hasSingleDocument = false;
    this.singleDocumentUrl = '';
    
    if (!patient.Documents || patient.Documents === 'Aucun' || patient.Documents === 'Aucun document') {
      console.log('Patient sans documents');
      this.showDocumentsModal = true;
      return;
    }
    
    try {
      const parsed = JSON.parse(patient.Documents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Cas: tableau de documents
        this.documentsList = parsed;
        this.hasSingleDocument = false;

      } else if (parsed && typeof parsed === 'object') {
        // Cas: objet document unique
        this.documentsList = [parsed];
        this.hasSingleDocument = false;

      } else {
        // Cas: simple chaîne
        this.hasSingleDocument = true;
        this.singleDocumentUrl = patient.Documents;
      }
    } catch (e) {
      console.error('Erreur de parsing JSON:', e);
      // Ce n'est pas du JSON, c'est une simple chaîne
      this.hasSingleDocument = true;
      this.singleDocumentUrl = patient.Documents;

    }
    
    this.showDocumentsModal = true;
  }
  
  // Méthode pour fermer le modal des documents
  fermerDocumentsModal(): void {
    this.showDocumentsModal = false;
    this.documentsList = [];
    this.hasSingleDocument = false;
    this.singleDocumentUrl = '';
    document.body.style.overflow = '';
  }
  
  // Méthode pour vérifier si le patient a des documents
  hasDocuments(patient: Patient): boolean {
    return !!(patient.Documents && 
           patient.Documents !== 'Aucun' && 
           patient.Documents !== 'Aucun document');
  }

  getDocumentsList(patient: Patient): any[] {
    if (!patient.Documents || patient.Documents === 'Aucun' || patient.Documents === 'Aucun document') {
      console.groupEnd();
      return [];
    }
    try {
      // Essayer de parser le JSON
      const parsed = JSON.parse(patient.Documents);
      let result = [];
      
      if (Array.isArray(parsed)) {
        console.log(`Tableau de ${parsed.length} documents`);
        result = parsed;
      } else if (parsed && typeof parsed === 'object') {
        result = [parsed];
      } else {
        result = [{ name: 'Document', url: String(parsed), content: String(parsed) }];
      }
      
      // Log chaque document
      result.forEach((doc, idx) => {
        if (typeof doc === 'object') {  
        } else {
          console.log(`  Valeur: ${String(doc).substring(0, 100)}`);
        }
      });
      
      console.groupEnd();
      return result;
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      console.groupEnd();
      return [{
        name: 'Document',
        url: patient.Documents,
        content: patient.Documents
      }];
    }
  }
  
  ouvrirDocument(url: string): void {
    console.log('=== DÉBOGAGE OUVERTURE DOCUMENT ===');
    console.log('URL reçue:', url);
    console.log('Type de url:', typeof url);
    console.log('Longueur de url:', url?.length);
    console.log('Stack trace:', new Error().stack);
    
    if (!url || url === 'undefined' || url === 'null' || url === '') {
      console.error('URL du document manquante ou invalide');
      alert('Impossible d\'ouvrir le document : URL manquante');
      return;
    }
    
    try {
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur ouverture:', error);
      alert('Erreur lors de l\'ouverture du document');
    }
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification(): void {
    this.showAlert = false;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    return '📎';
  }

  getDocumentUrl(doc: any): string {
    console.log('Document reçu dans getDocumentUrl:', doc);
    
    if (!doc) {
      console.error('Document null ou undefined');
      return '';
    }
    
    // Si c'est une chaîne de caractères
    if (typeof doc === 'string') {
      console.log('Document est une chaîne:', doc.substring(0, 100));
      return doc;
    }
    
    // Si c'est un objet, vérifier les propriétés possibles
    if (typeof doc === 'object') {
      // Vérifier les différentes propriétés possibles pour l'URL
      if (doc.url) {
        console.log('URL trouvée dans doc.url:', doc.url.substring(0, 100));
        return doc.url;
      }
      if (doc.content) {
        console.log('URL trouvée dans doc.content:', doc.content.substring(0, 100));
        return doc.content;
      }
      if (doc.fileUrl) {
        console.log('URL trouvée dans doc.fileUrl:', doc.fileUrl.substring(0, 100));
        return doc.fileUrl;
      }
      if (doc.data) {
        console.log('URL trouvée dans doc.data:', doc.data.substring(0, 100));
        return doc.data;
      }
      
      // Si le document stocke directement le contenu Base64 dans l'objet
      for (const key in doc) {
        if (typeof doc[key] === 'string' && (doc[key].startsWith('data:') || doc[key].startsWith('http'))) {
          console.log(`URL trouvée dans doc.${key}:`, doc[key].substring(0, 100));
          return doc[key];
        }
      }
      
      console.warn('Aucune propriété URL trouvée dans le document:', Object.keys(doc));
    }
    
    return '';
  }

  // Nouvelle méthode qui prend l'objet document complet
ouvrirDocumentComplet(doc: any): void {

  if (!doc) {
    console.error('Document null');
    alert('Document invalide');
    return;
  }
  
  let url = '';

  if (typeof doc === 'string') {
    url = doc;
  } 

  else if (typeof doc === 'object') {
    url = doc.url || doc.content || doc.fileUrl || doc.data || doc.link || doc.path || '';
    if (!url) {
      for (const key in doc) {
        if (typeof doc[key] === 'string' && 
            (doc[key].startsWith('data:') || 
             doc[key].startsWith('http') || 
             doc[key].startsWith('/') ||
             doc[key].length > 100)) {
          url = doc[key];
          console.log(`URL trouvée dans la propriété "${key}":`, url.substring(0, 100));
          break;
        }
      }
    }
  }
  
  console.log('URL extraite:', url ? url.substring(0, 200) : 'AUCUNE');
  
  if (!url) {
    console.error('Impossible d\'extraire l\'URL du document');
    alert('Structure de document inconnue. Voir console pour détails.');
    return;
  }
  
  
  try {
    window.open(url, '_blank');
  } catch (error) {
    console.error('Erreur ouverture:', error);
    alert('Erreur lors de l\'ouverture');
  }
}


getDocumentUrlDebug(doc: any): string {
  if (!doc) return 'Document null';
  if (typeof doc === 'string') return doc.substring(0, 100);
  if (typeof doc === 'object') {
    const url = doc.url || doc.content || 'Aucune URL';
    return typeof url === 'string' ? url.substring(0, 100) : String(url);
  }
  return 'Type inconnu: ' + typeof doc;
}
}
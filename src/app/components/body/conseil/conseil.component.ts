import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { Conseil } from '../../../models/Conseil';
import { ConseilService } from '../../../_helps/Docteur/Conseil/Conseil.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conseil',
  standalone: true,
  imports: [HeaderComponent, CommonModule,      // ✅ Pour *ngFor, *ngIf, etc.
    FormsModule, FooterComponent],
  templateUrl: './conseil.component.html',
  styleUrl: './conseil.component.css'
})
export class ConseilComponent implements OnInit, OnDestroy {
  conseils: Conseil[] = [];
  loading: boolean = false;
  error: string = '';
  searchQuery: string = '';
  selectedCategorie: string = '';
  
  private routerSubscription?: Subscription;

  categories = [
    'Tous',
    'NUTRITION',
    'BIEN-ÊTRE',
    'VIRUS ET ÉPIDÉMIES',
    'AMOUR ET SEXO',
    'PÉDIATRIE / PARENTALITÉ',
    'SANTÉ'
  ];

  constructor(
    private conseilService: ConseilService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Charger les conseils au démarrage
    this.loadConseils();
    
    // ✅ SOLUTION 1: Recharger à chaque navigation vers ce composant
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadConseils();
    });
  }

  ngOnDestroy(): void {
    // Nettoyer la souscription pour éviter les fuites mémoire
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadConseils(): void {
    this.loading = true;
    this.error = '';
    
    this.conseilService.getConseilsPublies().subscribe({
      next: (data) => {
        this.conseils = data;
        this.loading = false;
        console.log('✅ Conseils chargés:', data.length); // Debug
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des conseils';
        console.error('❌ Erreur:', err);
        this.loading = false;
      }
    });
  }

  filterByCategorie(categorie: string): void {
    this.selectedCategorie = categorie;
    this.loading = true;

    if (categorie === 'Tous' || categorie === '') {
      this.loadConseils();
    } else {
      this.conseilService.getConseilsByCategorie(categorie).subscribe({
        next: (data) => {
          this.conseils = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du filtrage';
          console.error('Erreur:', err);
          this.loading = false;
        }
      });
    }
  }

  searchConseils(): void {
    if (this.searchQuery.trim() === '') {
      this.loadConseils();
      return;
    }

    this.loading = true;
    this.conseilService.rechercherConseils(this.searchQuery).subscribe({
      next: (data) => {
        this.conseils = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la recherche';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  getTagClass(tag: string): string {
    const tagMap: { [key: string]: string } = {
      'NUTRITION': 'tag-orange',
      'BIEN-ÊTRE': 'tag-green',
      'VIRUS ET ÉPIDÉMIES': 'tag-yellow',
      'AMOUR ET SEXO': 'tag-pink',
      'PÉDIATRIE / PARENTALITÉ': 'tag-pink',
      'SANTÉ': 'tag-pink'
    };
    return tagMap[tag] || 'tag-blue';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  
  /**
   * Empêcher le comportement par défaut d'un lien
   */
  preventDefault(event: Event): void {
    event.preventDefault();
  }
}
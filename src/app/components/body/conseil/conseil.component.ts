
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { Conseil } from '../../../models/Conseil';
import { ConseilService } from '../../../_helps/Docteur/Conseil/Conseil.service';

@Component({
  selector: 'app-conseil',
  standalone: true,
  imports: [HeaderComponent,FooterComponent],
  templateUrl: './conseil.component.html',
  styleUrl: './conseil.component.css'
})
export class ConseilComponent implements OnInit {
  conseils: Conseil[] = [];
  loading: boolean = false;
  error: string = '';
  searchQuery: string = '';
  selectedCategorie: string = '';

  categories = [
    'Tous',
    'NUTRITION',
    'BIEN-ÊTRE',
    'VIRUS ET ÉPIDÉMIES',
    'AMOUR ET SEXO',
    'PÉDIATRIE / PARENTALITÉ',
    'SANTÉ'
  ];

  constructor(private conseilService: ConseilService) { }

  ngOnInit(): void {
    this.loadConseils();
  }

  loadConseils(): void {
    this.loading = true;
    this.error = '';
    
    this.conseilService.getConseilsPublies().subscribe({
      next: (data) => {
        this.conseils = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des conseils';
        console.error('Erreur:', err);
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
}



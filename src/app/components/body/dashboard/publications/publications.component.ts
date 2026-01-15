import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publication } from '../../../../models/Publication';
import { filter, Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { PublicationService } from '../../../../_helps/publication.service';
import { HeaderComponent } from "../../../header/header.component";


@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css']
})
export class PublicationsComponent {
  publications: Publication[] = [];
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
     private publicationService: PublicationService,
     private router: Router
   ) { }
 
   ngOnInit(): void {
     // Charger les publication au démarrage
     this.loadPublication(); 
     // ✅ SOLUTION 1: Recharger à chaque navigation vers ce composant
     this.routerSubscription = this.router.events.pipe(
       filter(event => event instanceof NavigationEnd)
     ).subscribe(() => {
       this.loadPublication();
     });
   }
 
   ngOnDestroy(): void {
     // Nettoyer la souscription pour éviter les fuites mémoire
     if (this.routerSubscription) {
       this.routerSubscription.unsubscribe();
     }
   }
 
   loadPublication(): void {
     this.loading = true;
     this.error = '';
     
     this.publicationService.getAllPublications().subscribe({
       next: (data) => {
         this.publications = data;
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
       this.loadPublication();
     } else {
       this.publicationService.getPublicationsByCategorie(categorie).subscribe({
         next: (data) => {
           this.publications = data;
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
       this.loadPublication();
       return;
     }
 
     this.loading = true;
     this.publicationService.rechercherPublications(this.searchQuery).subscribe({
       next: (data) => {
         this.publications = data;
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


   onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}

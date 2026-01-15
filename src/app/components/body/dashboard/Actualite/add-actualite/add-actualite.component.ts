import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PublicationService } from '../../../../../_helps/publication.service';
import { Publication } from '../../../../../models/Publication';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-actualite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-actualite.component.html',
  styleUrl: './add-actualite.component.css'
})
export class AddActualiteComponent {

  publicationForm!: FormGroup;
  submitted = false;
  loading = false;
  success = '';
  error = '';
  selectedImage!: File | null;
  imagePreview: string | ArrayBuffer | null = null;
  imageInvalid = false;

  constructor(
    private formBuilder: FormBuilder,
    private publicationService: PublicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCurrentUser();
  }

  initForm(): void {
    this.publicationForm = this.formBuilder.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      auteur: ['', [Validators.required]], // Sera rempli automatiquement
      contenu: ['', [Validators.required, Validators.minLength(50)]],
      imageUrl: ['']
    });
  }

  // Récupérer l'utilisateur connecté
  loadCurrentUser(): void {
    // Supposons que vous avez un service d'authentification
    // Remplacez ceci par votre logique réelle
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.publicationForm.patchValue({
        auteur: user.name || user.username || 'Docteur'
      });
    } else {
      // Valeur par défaut si pas d'utilisateur
      this.publicationForm.patchValue({
        auteur: 'Docteur inconnu'
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    
    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner un fichier image valide';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'L\'image ne doit pas dépasser 5MB';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    // Convertir en Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.imagePreview = base64String;
      this.publicationForm.patchValue({ imageUrl: base64String });
    };
    reader.readAsDataURL(file);
  }
  // Raccourci pour accéder aux contrôles du formulaire
  get f() {
    return this.publicationForm.controls;
  }

  onImageError(): void {
    this.publicationForm.patchValue({ imageUrl: '' });
    this.error = 'URL de l\'image invalide ou inaccessible';
    setTimeout(() => this.error = '', 3000);
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    // Vérifier si le formulaire est valide
    // if (this.publicationForm.invalid) {
    //   this.error = 'Veuillez remplir tous les champs obligatoires correctement';
    //   this.scrollToTop();
    //   return;
    // }

    this.loading = true;

    const nouveauPublication: Publication = {
      titre: this.publicationForm.value.titre,
      contenu: this.publicationForm.value.contenu,
      imageUrl: this.publicationForm.value.imageUrl || undefined,
      datePublication: new Date()
    };

    // Appeler le service
    this.publicationService.creerPublication(nouveauPublication).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'publication créée avec succès !';
        this.scrollToTop();
        
        // Réinitialiser le formulaire après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/DocDash/getpub']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la création des actualités:', error);
        this.error = 'Erreur lors de la création des actualités. Veuillez réessayer.';
        this.scrollToTop();
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.publicationForm.reset();
    this.loadCurrentUser(); // Recharger l'auteur
    this.error = '';
    this.success = '';
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}

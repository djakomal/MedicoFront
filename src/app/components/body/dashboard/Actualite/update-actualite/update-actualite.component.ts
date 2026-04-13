import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PublicationService } from '../../../../../_helps/publication.service';
import { Publication } from '../../../../../models/Publication';

@Component({
  selector: 'app-update-actualite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './update-actualite.component.html',
  styleUrl: './update-actualite.component.css'
})
export class UpdateActualiteComponent implements OnInit {

  publicationForm!: FormGroup;
  publicationId!: number;

  submitted   = false;
  loading     = false;
  loadingData = true;
  success     = '';
  error       = '';

  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private publicationService: PublicationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialise le formulaire vide
    this.publicationForm = this.fb.group({
      titre:    ['', [Validators.required, Validators.minLength(5)]],
      contenu:  ['', [Validators.required, Validators.minLength(50)]],
      imageUrl: ['']
    });

    // Récupère l'ID depuis l'URL (/updatepub/:id)
    this.publicationId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.publicationId) {
      this.error       = 'Identifiant de la publication introuvable.';
      this.loadingData = false;
      return;
    }

    // Charge les données existantes
    this.publicationService.getPublicationById(this.publicationId).subscribe({
      next: (pub: Publication) => {
        this.publicationForm.patchValue({
          titre:    pub.titre,
          contenu:  pub.contenu,
          imageUrl: pub.imageUrl || ''
        });

        // Affiche l'aperçu de l'image existante
        if (pub.imageUrl) {
          this.imagePreview = pub.imageUrl;
        }

        this.loadingData = false;
      },
      error: (err) => {
        this.error       = 'Impossible de charger la publication.';
        this.loadingData = false;
        console.error(err);
      }
    });
  }

  /* ── Accesseur formulaire ── */
  get f() { return this.publicationForm.controls; }

  /* ── Sélection image ── */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner un fichier image valide.';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = "L'image ne doit pas dépasser 5 MB.";
      setTimeout(() => this.error = '', 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview = base64;
      this.publicationForm.patchValue({ imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  onImageError(): void {
    this.publicationForm.patchValue({ imageUrl: '' });
    this.imagePreview = null;
  }

  /* ── Soumission ── */
  onSubmit(): void {
    this.submitted = true;
    this.error     = '';
    this.success   = '';

    Object.keys(this.publicationForm.controls)
      .forEach(k => this.publicationForm.get(k)!.markAsTouched());

    if (this.publicationForm.invalid) {
      this.error = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.loading = true;

    const publication: Publication = {
      titre:           this.publicationForm.value.titre,
      contenu:         this.publicationForm.value.contenu,
      imageUrl:        this.publicationForm.value.imageUrl || undefined,
      datePublication: new Date()
    };

    this.publicationService.updatePublication(this.publicationId, publication).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Publication mise à jour avec succès !';
        this.scrollToTop();
        setTimeout(() => this.router.navigate(['/DocDash/getpub']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error   = 'Erreur lors de la mise à jour. Veuillez réessayer.';
        this.scrollToTop();
        console.error(err);
      }
    });
  }

  /* ── Réinitialiser ── */
  onReset(): void {
    this.submitted    = false;
    this.error        = '';
    this.success      = '';
    this.imagePreview = null;
    this.publicationForm.reset();
  }

  /* ── Annuler ── */
  onCancel(): void {
    this.router.navigate(['/DocDash/getpub']);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
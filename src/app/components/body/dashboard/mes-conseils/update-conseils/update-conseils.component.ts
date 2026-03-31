import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import  { ConseilService } from '../../../../../_helps/Docteur/Conseil/Conseil.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Conseil } from '../../../../../models/Conseil';

@Component({
  selector: 'app-update-conseils',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './update-conseils.component.html',
  styleUrl: './update-conseils.component.css'
})
export class UpdateConseilsComponent implements OnInit {
  conseilForm!: FormGroup;
  currentStep = 1;
  conseilId!: number;

  submitted = false;
  loading = false;
  loadingData = true;
  error = '';
  success = '';

  categories = [
    { value: 'nutrition',  label: 'Nutrition' },
    { value: 'bien-etre',  label: 'Bien-être' },
    { value: 'virus',      label: 'Virus et épidémies' },
    { value: 'amour',      label: 'Amour et sexo' },
    { value: 'pediatrie',  label: 'Pédiatrie / Parentalité' },
    { value: 'sante',      label: 'Santé générale' },
  ];

  dropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private conseilService: ConseilService ,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialise le formulaire vide
    this.conseilForm = this.fb.group({
      titre:    ['', [Validators.required, Validators.minLength(5)]],
      contenu:  ['', [Validators.required, Validators.minLength(50)]],
      auteur:   ['', Validators.required],
      categorie:['', Validators.required],
      imageUrl: [''],
      tags:     this.fb.array([]),
      publie:   [false]
    });

    // Récupère l'ID depuis l'URL (/update-conseils/:id)
    this.conseilId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.conseilId) {
      this.error = 'Identifiant du conseil introuvable.';
      this.loadingData = false;
      return;
    }

    // Charge les données existantes
    this.conseilService.getConseilById(this.conseilId).subscribe({
      next: (conseil: Conseil) => {
        // Pré-remplit les champs simples
        this.conseilForm.patchValue({
          titre:    conseil.titre,
          contenu:  conseil.contenu,
          auteur:   conseil.auteur,
          categorie: conseil.categorie,
          imageUrl: conseil.imageUrl || '',
          publie:   conseil.publie
        });

        // Pré-remplit les tags
        this.tags.clear();
        (conseil.tags || []).forEach((tag: string) => {
          this.tags.push(this.fb.control(tag, Validators.required));
        });

        this.loadingData = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger le conseil.';
        console.error(err);
        this.loadingData = false;
      }
    });
  }

  /* ── Accesseurs ── */
  get f() { return this.conseilForm.controls; }

  get tags(): FormArray {
    return this.conseilForm.get('tags') as FormArray;
  }

  /* ── Dropdown catégorie ── */
  toggleDropdown(): void  { this.dropdownOpen = !this.dropdownOpen; }

  selectCategory(value: string): void {
    this.conseilForm.patchValue({ categorie: value });
    this.dropdownOpen = false;
  }

  getLabelFromValue(value: string): string {
    return this.categories.find(c => c.value === value)?.label || '';
  }

  /* ── Tags ── */
  addTag(): void    { this.tags.push(this.fb.control('', Validators.required)); }
  removeTag(i: number): void { this.tags.removeAt(i); }

  /* ── Navigation multi-étapes ── */
  nextStep(): void {
    if (this.currentStep === 1) {
      ['titre', 'auteur', 'categorie'].forEach(k => this.conseilForm.get(k)!.markAsTouched());
      if (this.f['titre'].invalid || this.f['auteur'].invalid || this.f['categorie'].invalid) {
        this.submitted = true;
        return;
      }
    }
    this.currentStep = Math.min(2, this.currentStep + 1);
  }

  prevStep(): void {
    this.currentStep = Math.max(1, this.currentStep - 1);
    this.submitted = false;
  }

  /* ── Image ── */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => this.conseilForm.patchValue({ imageUrl: reader.result as string });
    reader.readAsDataURL(input.files[0]);
  }

  /* ── Soumission ── */
  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    Object.keys(this.conseilForm.controls).forEach(k => this.conseilForm.get(k)!.markAsTouched());

    if (this.conseilForm.invalid) {
      this.error = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.loading = true;

    const conseil: Conseil = {
      titre:     this.conseilForm.value.titre,
      contenu:   this.conseilForm.value.contenu,
      auteur:    this.conseilForm.value.auteur,
      categorie: this.conseilForm.value.categorie,
      imageUrl:  this.conseilForm.value.imageUrl || '',
      tags:      this.conseilForm.value.tags.filter((t: string) => t.trim() !== ''),
      publie:    this.conseilForm.value.publie,
      datePublication:  new Date() 
    };

    this.conseilService.updateConseil(this.conseilId, conseil).subscribe({
      next: () => {
        this.success = 'Conseil mis à jour avec succès !';
        this.loading = false;
        setTimeout(() => {
          this.router.navigateByUrl('/DocDash/getConseils');
        }, 2000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour du conseil.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  /* ── Annuler ── */
  onCancel(): void {
    this.router.navigateByUrl('/DocDash/getConseils');
  }
}
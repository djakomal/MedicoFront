import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConseilService } from '../../../../_helps/Docteur/Conseil/Conseil.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Conseil } from '../../../../models/Conseil';

@Component({
  selector: 'app-mes-conseils',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mes-conseils.component.html',
  styleUrls: ['./mes-conseils.component.css']
})
export class MesConseilsComponent implements OnInit {
  conseilForm!: FormGroup;
  currentStep = 1; // ✅ AJOUTÉ
  
  submitted = false;
  loading = false;
  error = '';
  success = '';
  
  categories = [
    { value: 'nutrition',    label: 'Nutrition' },
    { value: 'bien-etre',    label: 'Bien-être' },
    { value: 'virus',        label: 'Virus et épidémies' },
    { value: 'amour',        label: 'Amour et sexo' },
    { value: 'pediatrie',    label: 'Pédiatrie / Parentalité' },
    { value: 'sante',        label: 'Santé générale' },
  ];
  
  
  
  

  constructor(
    private formBuilder: FormBuilder,
    private conseilService: ConseilService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.conseilForm = this.formBuilder.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      contenu: ['', [Validators.required, Validators.minLength(50)]],
      auteur: ['', Validators.required],
      categorie: ['', Validators.required],
      imageUrl: [''],
      tags: this.formBuilder.array([]),
      publie: [false]
    });
  }

  get f() { 
    return this.conseilForm.controls; 
  }
  
  get tags(): FormArray {
    return this.conseilForm.get('tags') as FormArray;
  }

  // ✅ Méthode pour obtenir l'icône de catégorie
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'VIRUS ET ÉPIDÉMIES': '🦠',
      'AMOUR ET SEXO': '💕',
      'BIEN-ÊTRE': '🧘',
      'NUTRITION': '🥗',
      'SANTÉ': '🏥',
      'PÉDIATRIE / PARENTALITÉ': '👶'
    };
    return icons[category] || '📋';
  }

  addTag(): void {
    this.tags.push(this.formBuilder.control('', Validators.required));
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  nextStep(): void {
    // Marque les contrôles du step 1 comme touchés pour afficher les erreurs
    if (this.currentStep === 1) {
      this.conseilForm.get('titre')!.markAsTouched();
      this.conseilForm.get('auteur')!.markAsTouched();
      this.conseilForm.get('categorie')!.markAsTouched();
      
      if (this.conseilForm.get('titre')!.invalid ||
          this.conseilForm.get('auteur')!.invalid ||
          this.conseilForm.get('categorie')!.invalid) {
        this.submitted = true; // Affiche les erreurs
        return; // Stop si invalide
      }
    }
    this.currentStep = Math.min(2, this.currentStep + 1);
  }

  prevStep(): void {
    this.currentStep = Math.max(1, this.currentStep - 1);
    this.submitted = false; 
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.conseilForm.patchValue({ imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    Object.keys(this.conseilForm.controls).forEach(key => {
      this.conseilForm.get(key)!.markAsTouched();
    });

    if (this.conseilForm.invalid) {
      this.error = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.loading = true;

    const conseil: Conseil = {
      titre: this.conseilForm.value.titre,
      contenu: this.conseilForm.value.contenu,
      auteur: this.conseilForm.value.auteur,
      categorie: this.conseilForm.value.categorie,
      imageUrl: this.conseilForm.value.imageUrl || '',
      tags: this.conseilForm.value.tags.filter((tag: string) => tag.trim() !== ''),
      datePublication: new Date(), // this.conseilForm.value.datePublication,
      publie: this.conseilForm.value.publie
    };

    this.conseilService.creerConseil(conseil).subscribe({
      next: (data) => {
        this.success = 'Conseil créé avec succès !';
        this.loading = false;
        setTimeout(() => {
          alert("Conseil ajouter avec succes");
          this.router.navigateByUrl("/DocDash/getConseils");
        }, 2000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la création du conseil';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });

    console.log('Tentative submit — form valid ?', this.conseilForm.valid);
    console.log('Form value:', this.conseilForm.value);
  }

  onReset(): void {
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.currentStep = 1;
    this.conseilForm.reset({
      titre: '',
      contenu: '',
      auteur: '',
      categorie: '',
      imageUrl: '',
      publie: false
    });
    this.tags.clear();
  }


  dropdownOpen = false;

toggleDropdown(): void {
  this.dropdownOpen = !this.dropdownOpen;
}

selectCategory(value: string): void {
  this.conseilForm.patchValue({ categorie: value });
  this.dropdownOpen = false;
}

getLabelFromValue(value: string): string {
  return this.categories.find(c => c.value === value)?.label || '';
}
}
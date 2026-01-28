// import { Component, OnInit } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { AuthService } from '../../../auth/auth.service';


// @Component({
//   selector: 'app-zoom-auth',
//   templateUrl: './zoom-auth.component.html',
//   styleUrls: ['./zoom-auth.component.css']
// })
// export class ZoomAuthComponent implements OnInit {
//   isLoading = false;
//   errorMessage = '';

//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit(): void {
//     // Vérifier si on est déjà connecté
//     if (this.authService.isLoggedIn()) {
//       this.router.navigate(['/meetings']);
//     }

//     // Vérifier si on a un code dans l'URL
//     this.route.queryParams.subscribe(params => {
//       const code = params['code'];
//       if (code) {
//         this.handleOAuthCallback(code);
//       }
//     });
//   }

//   // Bouton "Se connecter avec Zoom"
//   connectWithZoom(): void {
//     this.isLoading = true;
//     this.authService.login();
//   }

//   // Gérer le callback OAuth
//   private handleOAuthCallback(code: string): void {
//     this.isLoading = true;
//     this.authService.handleAuthCallback(code).subscribe({
//       next: (success) => {
//         if (success) {
//           this.router.navigate(['/meetings']);
//         } else {
//           this.errorMessage = 'Échec de l\'authentification avec Zoom';
//           this.isLoading = false;
//         }
//       },
//       error: (error) => {
//         this.errorMessage = 'Erreur lors de l\'authentification';
//         console.error(error);
//         this.isLoading = false;
//       }
//     });
//   }
// }
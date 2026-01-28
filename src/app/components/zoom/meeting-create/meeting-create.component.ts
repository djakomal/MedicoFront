// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { CreateMeetingRequest } from '../../../_helps/ZoomService/zoom-service.service';


// @Component({
//   selector: 'app-meeting-create',
//   imports:[CommonModule,ReactiveFormsModule,FormsModule],
//   templateUrl: './meeting-create.component.html',
//   styleUrls: ['./meeting-create.component.css']
// })
// export class MeetingCreateComponent implements OnInit {
//   meetingForm: FormGroup;
//   isLoading = false;
//   errorMessage = '';
//   timezones = [
//     'Europe/Paris',
//     'America/New_York',
//     'America/Los_Angeles',
//     'Asia/Tokyo',
//     'Australia/Sydney',
//     'UTC'
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private zoomApiService: ZoomServiceService,
//     private router: Router
//   ) {
//     this.meetingForm = this.fb.group({
//       topic: ['', [Validators.required, Validators.minLength(3)]],
//       startTime: ['', Validators.required],
//       duration: [60, [Validators.required, Validators.min(1)]],
//       timezone: ['Europe/Paris', Validators.required]
//     });

//     // Définir la date/heure par défaut (maintenant + 1 heure)
//     const now = new Date();
//     now.setHours(now.getHours() + 1);
//     now.setMinutes(0);
//     this.meetingForm.patchValue({
//       startTime: now.toISOString().slice(0, 16)
//     });
//   }

//   ngOnInit(): void {}

//   onSubmit(): void {
//     if (this.meetingForm.valid) {
//       this.isLoading = true;
//       const meetingData: CreateMeetingRequest = this.meetingForm.value;

//       this.zoomApiService.createMeeting(meetingData).subscribe({
//         next: (response) => {
//           this.isLoading = false;
//           alert('Réunion créée avec succès !');
//           this.router.navigate(['/meetings']);
//         },
//         error: (error) => {
//           console.error('Erreur création réunion:', error);
//           this.errorMessage = error.message || 'Erreur lors de la création';
//           this.isLoading = false;
//         }
//       });
//     }
//   }

//   get formControls() {
//     return this.meetingForm.controls;
//   }
// }
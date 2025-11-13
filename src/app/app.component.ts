import { Component, Injectable, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

// import { RegisteDetComponent } from './admin/main/registe-det/registe-det.component';

// import { NotificationComponent } from './admin/notification/notification.component';

import { CommonModule } from '@angular/common';
import { NoteConfirmationComponent } from './components/note-confirmation/note-confirmation.component';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { SingleBlogComponent } from './components/single-blog/single-blog.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { DoctorComponent } from './components/body/doctor/doctor.component';
import { BodyComponent } from './components/body/body.component';
import { AboutComponent } from './components/body/about/about.component';
import { DepartementComponent } from './components/body/departement/departement.component';
import { ElementsComponent } from './components/body/elements/elements.component';
import { ServiceComponent } from './components/body/service/service.component';
import { BlogComponent } from './components/body/blog/blog.component';
import { DashboardComponent } from './components/body/dashboard/dashboard.component';
import { ContactComponent } from './components/body/contact/contact.component';
import { AdminComponent } from './components/admin/admin.component';
import { AppointmentComponent } from './components/admin/main/appointment/appointment.component';
import { FormulaireComponent } from './components/admin/formulaire/formulaire.component';

import { RegisterComponent } from './components/register/register.component';
import { UpdateComponent } from './components/register/update/update.component';
import { ReactiveFormsModule } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet,
    HeaderComponent,
    DoctorComponent,
    BodyComponent,
    FooterComponent,
    AboutComponent,
    DepartementComponent,
    ElementsComponent,
    ServiceComponent,
    BlogComponent,
    SingleBlogComponent,
    ConnexionComponent,
    DashboardComponent,
    ContactComponent,
    HttpClientModule,
    AdminComponent,
    AppointmentComponent,
    FormulaireComponent,
    NoteConfirmationComponent,
    UpdateComponent,
    RegisterComponent,
    CommonModule,
    ReactiveFormsModule
  ],
})
export class AppComponent {
  title = 'Centre-Medical';
}

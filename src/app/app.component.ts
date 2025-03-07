import { Component, Injectable, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './header/header.component';

import { DoctorComponent } from './body/doctor/doctor.component';
import { BlogComponent } from './body/blog/blog.component';
import { ServiceComponent } from './body/service/service.component';
import { AboutComponent } from './body/about/about.component';
import { DepartementComponent } from './body/departement/departement.component';
import { ElementsComponent } from './body/elements/elements.component';
import { BodyComponent } from './body/body.component';
import { FooterComponent } from './footer/footer.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { SingleBlogComponent } from './single-blog/single-blog.component';
import { DashboardComponent } from './body/dashboard/dashboard.component';
import { ContactComponent } from './body/contact/contact.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AdminComponent } from './admin/admin.component';
// import { RegisteDetComponent } from './admin/main/registe-det/registe-det.component';
import { AppointmentComponent } from './admin/main/appointment/appointment.component';
// import { NotificationComponent } from './admin/notification/notification.component';
import { FormulaireComponent } from './admin/formulaire/formulaire.component';
import { NoteConfirmationComponent } from './note-confirmation/note-confirmation.component';
import { UpdateComponent } from './body/register/update/update.component';
import { RegisterComponent } from './register/register.component';
import { CommonModule } from '@angular/common';

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
    CommonModule
  ],
})
export class AppComponent {
  title = 'Centre-Medical';
}

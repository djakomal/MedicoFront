import { Routes } from '@angular/router';

import { NoteConfirmationComponent } from './components/note-confirmation/note-confirmation.component';
import { DashboardComponent } from './components/body/dashboard/dashboard.component';
import { AboutComponent } from './components/body/about/about.component';
import { DoctorComponent } from './components/body/doctor/doctor.component';
import { ServiceComponent } from './components/body/service/service.component';
import { DepartementComponent } from './components/body/departement/departement.component';
import { ElementsComponent } from './components/body/elements/elements.component';
import { BlogComponent } from './components/body/blog/blog.component';
import { AppointmentComponent } from './components/admin/main/appointment/appointment.component';
import { RegisteDetComponent } from './components/admin/main/registe-det/registe-det.component';
import { FormulaireComponent } from './components/admin/formulaire/formulaire.component';
import { SingleBlogComponent } from './components/single-blog/single-blog.component';
import { ContactComponent } from './components/body/contact/contact.component';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { AdminComponent } from './components/admin/admin.component';
import { BodyComponent } from './components/body/body.component';
import { RegisterComponent } from './components/register/register.component';
import { AppointComponent } from './components/body/appoint/appoint.component';
import { authGuard } from './_helps/Guard/auth.guard';
import { UserDashboardComponent } from './components/body/dashboard/user-dashboard/user-dashboard.component';
import { DocRegisterComponent } from './components/docteurAuth/doc-register/doc-register.component';
import { DocLoginComponent } from './components/docteurAuth/doc-login/doc-login.component';

import { MesRendezVousComponent } from './components/body/dashboard/mes-rendez-vous/mes-rendez-vous.component';
import { MesPatientsComponent } from './components/body/dashboard/mes-patients/mes-patients.component';
import { MesConseilsComponent } from './components/body/dashboard/mes-conseils/mes-conseils.component';
import { InfosPersonnellesComponent } from './components/body/dashboard/infos-personnelles/infos-personnelles.component';
import { TypesConsultationsComponent } from './components/body/dashboard/types-consultations/types-consultations.component';
import { MesHorairesComponent } from './components/body/dashboard/mes-horaires/mes-horaires.component';
import { MesExperiencesComponent } from './components/body/dashboard/mes-experiences/mes-experiences.component';
import { MesFormationsComponent } from './components/body/dashboard/mes-formations/mes-formations.component';
import { LanguesParleesComponent } from './components/body/dashboard/langues-parlees/langues-parlees.component';
import { PublicationsComponent } from './components/body/dashboard/publications/publications.component';
import { AssociationsComponent } from './components/body/dashboard/associations/associations.component';
import { DocDashboardComponent } from './components/body/dashboard/doc-dashboard/doc-dashboard.component';
import { ConseilComponent } from './components/body/conseil/conseil.component';
1

export const routes: Routes = [
  {
    path: 'regis',
    component: RegisterComponent,
  },

  // {
  //   path: '',
  //   redirectTo: 'Dash',
  //   pathMatch: 'full',
  // },
  {
    path: 'Dash',
    component: DashboardComponent,
  },
  {
    path: 'About',
    component: AboutComponent,
  },
  {
    path: 'noteConfirmation',
    component: NoteConfirmationComponent,
  },

  {
    path: 'Doc',
    component: DoctorComponent,
  },
  {
    path: 'Serv',
    component: ServiceComponent,
  },
  {
    path: 'Depart',
    component: DepartementComponent,
  },
  {
    path: 'Elem',
    component: ElementsComponent,
  },
  {
    path: 'Ap',
    component: AppointComponent,
  },
  {
    path: 'Blog',
    component: BlogComponent,
  },

  {
    path: 'noteConfirmation',
    component: NoteConfirmationComponent,
  },
  {
    path: 'Admin/app',
    component: AppointmentComponent,
  },
  {
    path: 'Admin/regGet',
    component: RegisteDetComponent,
  },
  {
    path: 'Admin/form',
    component: FormulaireComponent,
  },

  {
    path: 'Single-blog',
    component: SingleBlogComponent,
  },
  {
    path: 'Cont',
    component: ContactComponent,
  },
  {
    path: 'connex',
    component: ConnexionComponent,
  },
  
  {
    path: 'conseil',
    component:ConseilComponent,
  },
  {
    path: 'UserDah',
    component: UserDashboardComponent,
    //  canActivate: [authGuard],
  },

  {
    path: 'DocRegist',
    component: DocRegisterComponent,
  },

  {
    path: 'DocLogin',
    component: DocLoginComponent,
  },
  


  {
    path: 'DocDash',
    component: DocDashboardComponent,
    children: [
      {
        path: 'MesRendezVous',
        component: MesRendezVousComponent,
      },
      {
        path: 'MesPatients',
        component: MesPatientsComponent,
      },
      {
        path: 'MesConseils',
        component: MesConseilsComponent,
      },
      {
        path: 'InfosPersonnelles',
        component: InfosPersonnellesComponent,
      },
      {
        path: 'TypesConsultations',
        component: TypesConsultationsComponent,
      },
      {
        path: 'MesHoraires',
        component: MesHorairesComponent,
      },
      {
        path: 'MesExperiences',
        component: MesExperiencesComponent,
      },
      {
        path: 'MesFormations',
        component: MesFormationsComponent,
      },
      {
        path: 'LanguesParlees',
        component: LanguesParleesComponent,
      },
      {
        path: 'Publications',
        component: PublicationsComponent,
      },
      {
        path: 'Associations',
        component: AssociationsComponent,
      },
    ]
     ,canActivate: [authGuard],
  },

  {
    path: 'Admin',
    component: AdminComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
  },

  {
    path: '**',
    component: DashboardComponent,
    pathMatch: 'full',
  },
  
];

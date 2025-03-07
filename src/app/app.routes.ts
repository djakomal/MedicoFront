import { Routes } from '@angular/router';
import { DashboardComponent } from './body/dashboard/dashboard.component';
import { AboutComponent } from './body/about/about.component';
import { DoctorComponent } from './body/doctor/doctor.component';
import { ServiceComponent } from './body/service/service.component';
import { DepartementComponent } from './body/departement/departement.component';
import { ElementsComponent } from './body/elements/elements.component';
import { BlogComponent } from './body/blog/blog.component';
import { ContactComponent } from './body/contact/contact.component';

import { ConnexionComponent } from './connexion/connexion.component';
import { SingleBlogComponent } from './single-blog/single-blog.component';
import { authGuard } from './_helps/auth.guard';
import { RegisterComponent } from './register/register.component';

import { BodyComponent } from './body/body.component';
import { AdminComponent } from './admin/admin.component';
import { AppointmentComponent } from './admin/main/appointment/appointment.component';
import { RegisteDetComponent } from './admin/main/registe-det/registe-det.component';
import { FormulaireComponent } from './admin/formulaire/formulaire.component';
import { NoteConfirmationComponent } from './note-confirmation/note-confirmation.component';




// import { ConnexionComponent } from './connexion/connexion.component';



export const routes: Routes = [

    {
        path: 'regis', component: RegisterComponent

    },

    {
        path: 'connex',
        redirectTo: 'connex',
        pathMatch: 'full'
    },
    {
        path: 'noteConfirmation', component: NoteConfirmationComponent
    },

    {
        path: 'Dash', component: DashboardComponent

    },
    {
        path: 'About', component: AboutComponent

    },

    {
        path: 'Doc', component: DoctorComponent,

    },
    {
        path: 'Serv', component: ServiceComponent
    },
    {
        path: 'Depart', component: DepartementComponent
    },
    {
        path: 'Elem', component: ElementsComponent

    },
    {
        path: 'Blog', component: BlogComponent

    },

    {
        path: 'noteConfirmation', component: NoteConfirmationComponent
    },
    {
        path: 'Admin/app', component: AppointmentComponent,

    },
    {
        path: 'Admin/regGet', component: RegisteDetComponent,
    },
    {
        path: 'Admin/form', component: FormulaireComponent,

    },

    {
        path: 'Single-blog', component: SingleBlogComponent

    },
    {
        path: 'Cont', component: ContactComponent

    },



    {
        path: "**",
        component: ConnexionComponent,
        pathMatch: "full"
    },
    {
        path: 'Dash',
        component: BodyComponent,
        canActivate: [authGuard], data: { role: 'USER' }
    },
    {
        path: 'Admin', component: AdminComponent,
        canActivate: [authGuard],
        data: { role: 'ADMIN' }
    },


];

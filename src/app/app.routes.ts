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
import { ConseilComponent } from './components/body/conseil/conseil.component';
import { UserDashboardComponent } from './components/body/dashboard/user-dashboard/user-dashboard.component';
import { DocRegisterComponent } from './components/docteurAuth/doc-register/doc-register.component';
import { DocLoginComponent } from './components/docteurAuth/doc-login/doc-login.component';
import { DocDashboardComponent } from './components/body/dashboard/doc-dashboard/doc-dashboard.component';





// import { ConnexionComponent } from './connexion/connexion.component';



export const routes: Routes = [

    {
        path: 'regis', component: RegisterComponent

    },

    {
        path: 'Dash',
        redirectTo: 'Dash',
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
        path: 'Ap', component: AppointComponent

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
        path: 'connex', component: ConnexionComponent

    },
    {
        path: 'conseil', component: ConseilComponent

    },
    {
        path: 'UserDah', component: UserDashboardComponent,canActivate: [authGuard],

    },

        {
        path: 'DocRegist', component: DocRegisterComponent

    },

        {
        path: 'DocLogin', component: DocLoginComponent

    },
        {
        path: 'DocDash', component: DocDashboardComponent,canActivate: [authGuard],

    },


    {
        path: "**",
        component: DashboardComponent,
        pathMatch: "full"
    },
    // {
    //     path: 'Dash',
    //     component: BodyComponent,
    //     canActivate: [authGuard], data: { role: 'USER' }
    // },
    {
        path: 'Admin', component: AdminComponent,
        canActivate: [authGuard],
        data: { role: 'ADMIN' }
    },
    // {
    //     path: 'UserDah', component: UserDashboardComponent,
    //     canActivate: [authGuard],
       
    // },


];

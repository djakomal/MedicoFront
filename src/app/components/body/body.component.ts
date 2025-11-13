import { Component, Injectable } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';

import { ElementsComponent } from './elements/elements.component';
import { DoctorComponent } from './doctor/doctor.component';
import { BlogComponent } from './blog/blog.component';
import { ServiceComponent } from './service/service.component';
import { DepartementComponent } from './departement/departement.component';
import { SingleBlogComponent } from '../single-blog/single-blog.component';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { NoteConfirmationComponent } from "../note-confirmation/note-confirmation.component";

@Injectable({
    providedIn: 'root'
  })
  

@Component({
    selector: 'app-body',
    standalone: true,
    templateUrl: './body.component.html',
    styleUrl: './body.component.css',
    imports: [DashboardComponent, ContactComponent,
    AboutComponent, SingleBlogComponent,
    DoctorComponent,
    ServiceComponent, DepartementComponent, SingleBlogComponent, RouterOutlet, HeaderComponent, NoteConfirmationComponent]
})
export class BodyComponent {

}

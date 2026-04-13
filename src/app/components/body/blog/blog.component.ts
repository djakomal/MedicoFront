import { Component } from '@angular/core';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {

}

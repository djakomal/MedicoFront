import { Component } from '@angular/core';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-elements',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './elements.component.html',
  styleUrl: './elements.component.css'
})
export class ElementsComponent {

}

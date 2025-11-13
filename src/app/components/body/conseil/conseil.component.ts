import { Component } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-conseil',
  standalone: true,
  imports: [HeaderComponent,FooterComponent],
  templateUrl: './conseil.component.html',
  styleUrl: './conseil.component.css'
})
export class ConseilComponent {

}

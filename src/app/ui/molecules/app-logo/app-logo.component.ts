import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-app-logo',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app-logo.component.html',
})
export class AppLogoComponent {
  @Input() title: string = 'Profit AI';
}


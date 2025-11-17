import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './core/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],          
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {}

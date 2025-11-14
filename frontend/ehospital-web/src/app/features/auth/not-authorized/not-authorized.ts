import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-authorized.html',
  styleUrls: ['./not-authorized.scss']
})
export class NotAuthorizedComponent {}


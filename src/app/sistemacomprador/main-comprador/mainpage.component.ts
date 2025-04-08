import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';




@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.css'
})
export class MainpageComponent {

  goToHome() {
    this.router.navigate(['comprador/main-comprador']); // Navigates to the AboutComponent
  }

  constructor(private router: Router, private authService: AuthService) {

  }
}

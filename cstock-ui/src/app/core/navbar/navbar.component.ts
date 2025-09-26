import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../security/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  displayingMenu = false;
  constructor(public auth: AuthService) {}

  ngOnInit() {
  }
}

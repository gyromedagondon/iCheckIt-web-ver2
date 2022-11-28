import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  constructor(public auth: AuthService, public router: Router) {}

  ngOnInit(): void {}

  display = false;

  public logout() {
    this.auth.signOut().then((a) => {
      this.router.navigate(['login']);
    });
  }

  public confirmLogout() {
    this.display = true;
  }

  public closeModal() {
    this.display = false;
  }
}

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-popup',
  templateUrl: './logout-popup.component.html',
  styleUrls: ['./logout-popup.component.css']
})
export class LogoutPopupComponent {
  constructor(private router: Router,private popUp:MatDialog) { }
  logout() {
    localStorage.clear()
    this.router.navigateByUrl("")
    this.popUp.closeAll()

  }
}

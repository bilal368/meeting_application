import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { PopupComponent } from 'src/app/shared/popup/popup.component';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {

  private onlineStatus = new BehaviorSubject<boolean>(true);

  constructor(private router: Router, private popUp: MatDialog) {
    this.onlineStatus.next(navigator.onLine);
    window.addEventListener('online', () => {
      this.onlineStatus.next(true);
    });
    window.addEventListener('offline', () => {
      this.onlineStatus.next(false);
    });
  }
  isOnline(): Observable<boolean> {
    return this.onlineStatus.asObservable();
  }



  getToken() {
    return !!localStorage.getItem("token")
  }

  logout() {
    localStorage.clear()
    this.router.navigateByUrl("")
    this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Session Expired" } })
  }
  updatePasswordLogout() {
    localStorage.clear()
    this.router.navigateByUrl("")
  }

}


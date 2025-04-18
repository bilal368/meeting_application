import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { VersionCheckService } from 'src/services/versioncheck/version-check.service';
import { PopupComponent } from './shared/popup/popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'mtnZoom';
  link = 'https://www.google.com/'
  private popupIsOpen = false;
  private onlineStatusSubscription: Subscription;
  constructor(private service: AuthguardService,private versionCheckService:VersionCheckService,private popUp:MatDialog) {

    this.onlineStatusSubscription = this.service.isOnline().subscribe((isOnline:any) => {
      if (!isOnline && !this.popupIsOpen) {
        this.openNetworkErrorPopup();
      }
    });
   }

  ngOnInit(): void {
    // this.service.networkError();
    // this.versionCheckService.initVersionCheck('/assets/version.json');
  }
  openNetworkErrorPopup() {
    this.popupIsOpen = true;
    this.popUp.open(PopupComponent, {
      width: "550px",
      height: "300px",
      data: { message: "Network is not available. Please check your internet connection." }
    }).afterClosed().subscribe(() => {
      this.popupIsOpen = false;
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.onlineStatusSubscription) {
      this.onlineStatusSubscription.unsubscribe();
    }
  }
}

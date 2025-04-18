import { Component, OnInit } from '@angular/core';
import { LogoutPopupComponent } from '../home/logout-popup/logout-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { PlanDetailsComponent } from '../plan-details/plan-details.component';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { PopupComponent } from '../shared/popup/popup.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName:any
  user:any
  constructor(private popUp:MatDialog,private Service:AuthguardService){}
  ngOnInit(): void {
    this.user = localStorage.getItem('displayName');
    this.userName = localStorage.getItem('email');
    // this.networkError()

  }
  logout(){
    this.popUp.open(LogoutPopupComponent, {
      width: '350px',
      height: 'auto',
    });

  }
  openPlanDetails(){
    this.popUp.open(PlanDetailsComponent, {
      width: '300px',
      height: '180px',

    });

  }


  popupIsOpen: boolean = false;

  networkError() {
    // Check if the popup is already open
    if (this.popupIsOpen) {
      return; // If open, do nothing
    }
  
    this.Service.isOnline().subscribe((resp) => {
      console.log(resp, "response");
      if (resp != true) {
        // Set the flag to true indicating the popup is open
        this.popupIsOpen = true;
        
        this.popUp.open(PopupComponent, {
          width: "550px",
          height: "300px",
          data: { message: "Network is not available. Please check your internet connection." }
        }).afterClosed().subscribe(() => {
          // Reset the flag when the popup is closed
          this.popupIsOpen = false;
        });
      } else {
        console.log("else case worked");
      }
    });
  }

}

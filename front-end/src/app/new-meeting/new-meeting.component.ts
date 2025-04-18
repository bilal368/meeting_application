import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NewMeetingService } from 'src/services/new-meeting/new-meeting.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../shared/popup/popup.component';
import { AuthguardService } from 'src/services/authguard/auth.service';

@Component({
  selector: 'app-new-meeting',
  templateUrl: './new-meeting.component.html',
  styleUrls: ['./new-meeting.component.css']
})
export class NewMeetingComponent {

  create: boolean = false
  userName: any = ''
  url: any = ''
  loginId: any = ''
  remainingMinutes: any = ''
  remainingSec: any = ''
  alert: any = ''
  alertSec: any = ''
  user : any

  constructor(private service: NewMeetingService, private router: Router, private popUp: MatDialog, private Service: AuthguardService, private auth: AuthguardService) {

    // const currentHost = window.location.host;
    // // Determine the protocol based on the current environment
    // const protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
    // // Construct the new URL with the dynamic host and protocol
    //  this.url = protocol + currentHost + '/home/newMeeting';
    // // Use the new URL
    // console.log(  "url", this.url);

  }

  sdkKey = 'D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU'
  // leaveUrl = 'http://localhost:4200/home/newMeeting'
  leaveUrl = "https://meetings.mtn.com/home/newMeeting"

  ngOnInit(): void {
    this.user = localStorage.getItem('userName')
    // this.userName = this.userName.replace('mtn.', '')
    this.userName = localStorage.getItem('email')
    this.loginId = localStorage.getItem('loginId')
    // this.networkError()

  }

  createMeeting() {

    this.create = true

    // const remaining = 2
    // const alert = remaining - 1
    // const alertSec = alert * 60000
    // const remainingSec = remaining * 60000

    // console.log("remaining>", remaining, "remainingSec >", remainingSec, "alert >", alert, "alertSec >", alertSec);

    this.service.checkHostbalance({ loginId: this.loginId }).subscribe((res: any) => {

      console.log(res);
      // res.data.RemainingMinutes
      this.remainingMinutes = res.data.RemainingMinutes
      this.remainingSec = res.data.RemainingMinutes * 60000
      this.alert = this.remainingMinutes - 5
      this.alertSec = this.alert * 60000

      const payload = {topic :this.user+"'s Meeting." }

      if (this.remainingMinutes > 5) {
        this.service.instantMeeting({ email: this.userName , payload : payload }).subscribe((res: any) => {


          // ZoomMtg.init({
          //   leaveUrl: this.leaveUrl,
          //   disablePreview: true,
          //   success: (success) => {
          //     console.log(success)
          //     ZoomMtg.join({
          //       signature: res.signature,
          //       sdkKey: this.sdkKey,
          //       meetingNumber: res.zoom_meeting_id,
          //       passWord: res.password,
          //       userName: res.username,
          //       userEmail: res.email,
          //       tk: "",
          //       zak: res.zak,
          //       success: (success) => {
          //         console.log(success)
          //       },
          //       error: (error) => {
          //         console.log(error)
          //       }
          //     })
          //   },
          //   error: (error) => {
          //     console.log(error)
          //   }
          // })
        }, err => {
          if (err.status = 401) {
            console.log("error", err);
            this.auth.logout()
          }
          else {
            console.log(err);
            this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
          }
        })

        setTimeout(() => {
          this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Remaining 5 mins" } })
        }, this.alertSec);

        setTimeout(() => {
          // ZoomMtg.endMeeting({
          //   success: function (res) {
          //     console.log('Meeting ended successfully');
          //   },
          //   error: function (res) {
          //     console.error(res);
          //   },
          // });
        }, this.remainingSec);

      } else {
        this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "You don't have a valid plan to start the meeting!!" } })
      }
    }, err => {
      console.log("error", err);
      this.auth.logout()
      // this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
    })


  }


  route() {
    this.router.navigateByUrl('/home/meeting-list')
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

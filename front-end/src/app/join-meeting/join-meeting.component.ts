import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JoinMeetingService } from 'src/services/joinMeeting/join-meeting.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../shared/popup/popup.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { environment } from 'src/environment';
import { LoginService } from 'src/services/login/login.service';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.css']
})
export class JoinMeetingComponent {

  joinForm: FormGroup
  loginId: any = ''
  meetingId: any = ''
  password: any = ''
  name: any = ''
  userName: any = ''
  remainingMinutes: any = ''
  displayName: any = ''
  sdkUrl: any

  constructor(private router: Router, private service: JoinMeetingService, private fb: FormBuilder, private popUp: MatDialog, private loginService: LoginService, private meetinglistService: MeetinglistService) {
    this.joinForm = this.fb.group({
      meetingId: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      name: ['', Validators.required],
      password: ['', Validators.required]
    })

    // const currentHost = window.location.host;
    // // Determine the protocol based on the current environment
    // const protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
    // // Construct the new URL with the dynamic host and protocol
    // const newUrl = protocol + currentHost + '/home/joinMeeting';
    // // Use the new URL
    // console.log(newUrl);

  }

  sdkKey = 'D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU'
  // leaveUrl = 'http://localhost:4200/home/joinMeeting'
  leaveUrl = 'https://meetings.mtn.com/home/joinMeeting'

  ngOnInit(): void {
    this.loginId = localStorage.getItem('loginId')
    // this.userName = localStorage.getItem('userName')
    this.userName = localStorage.getItem('email')
    this.displayName = localStorage.getItem('displayName')
    this.sdkUrl = environment.apiUrl;
    this.joinForm.patchValue({
      name: this.displayName
    })

  }

  getSignature() {
    this.popUp.open(LoadingSpinnerComponent)
    this.meetingId = this.joinForm.value.meetingId
    this.meetinglistService.checkUserBundleBalance({ loginId: this.loginId, meetingId: this.meetingId }).subscribe((res: any) => {
      console.log("res", res);
      if (res.data.MeetingUserType == "Host") {
        this.remainingMinutes = res.data.RemainingMinutes
        if (res.data.RemainingMinutes > 1) {
          this.service.signature({ role: "1", meetingNumber: this.meetingId }).subscribe((res: any) => {
            this.joinMeetingWithRemainingMinutes(res, this.remainingMinutes)
            this.popUp.closeAll()
          })
        } else {
          console.log("sugnature 1st call error");
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "You don't have a valid plan to start the meeting!!" } })
        }
      } else {
        this.service.signature({ role: "0", meetingNumber: this.meetingId }).subscribe((res: any) => {
          console.log(res.signature, res.zak);
          this.meetingId = this.joinForm.value.meetingId
          this.name = this.joinForm.value.name
          this.password = this.joinForm.value.password
          this.joinMeeting(res)
          this.popUp.closeAll()
        }, err => {
          console.log("signature error");
          console.log("error", err);
          if (err.status == 504) {
            this.popUp.closeAll()
            this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
          } else {
            this.popUp.closeAll()
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
          }
        })
      }
    }, err => {
      if (err.status == 404) {
        this.service.signature({ role: "0", meetingNumber: this.meetingId }).subscribe((res: any) => {
          console.log(res.signature, res.zak);
          this.joinMeeting(res)
          this.popUp.closeAll()
        }, err => {
          console.log("signature", err);
          if (err.status == 504) {
            this.popUp.closeAll()
            this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
          } else {
            this.popUp.closeAll()
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
          }
        })
      } else if (err.status == 504) {
        this.popUp.closeAll()
        this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
      }
      else {
        this.popUp.closeAll()
        this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
      }
    })
  }

  joinMeeting(res: any) {
    this.meetingId = this.joinForm.value.meetingId
    this.name = this.joinForm.value.name
    this.password = this.joinForm.value.password
    const data = {
      signature: res.signature, zoom_meeting_id: this.meetingId, password: this.password,
      username: this.name, email: "", zak: res.zak
    }
    const dataString = JSON.stringify(data)
    // window.open(`${this.sdkUrl}`+'?data=' + dataString)
    var newWindow = window.open(`${this.sdkUrl}` + '?data=' + dataString, "_self")
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      // Pop-up is blocked, show a message or perform any other action
      console.log('Pop-up is blocked. Please enable pop-ups for this site to use all features.');
      window.alert("Pop-up is blocked. Please enable pop-ups for this site to use all features")
    }

  }

  joinMeetingWithRemainingMinutes(res: any, remainingMinutes: any) {
    this.meetingId = this.joinForm.value.meetingId
    this.name = this.joinForm.value.name
    this.password = this.joinForm.value.password
    const data = {
      signature: res.signature, zoom_meeting_id: this.meetingId, password: this.password,
      username: this.name, email: "", zak: res.zak, remainingMinutes: remainingMinutes
    }
    const dataString = JSON.stringify(data)
    // window.open(`${this.sdkUrl}` + '?data=' + dataString)
    var newWindow = window.open(`${this.sdkUrl}` + '?data=' + dataString)
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      // Pop-up is blocked, show a message or perform any other action
      console.log('Pop-up is blocked. Please enable pop-ups for this site to use all features.');
      window.alert("Pop-up is blocked. Please enable pop-ups for this site to use all features")
    }
  }
  setProfileNotification(type: any) {
    this.loginService.setProfileRoute(type)
  }
  route() {
    this.router.navigateByUrl('/home/meeting-list')
  }

}

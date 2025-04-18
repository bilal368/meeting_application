import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../shared/popup/popup.component';
import { NewMeetingService } from 'src/services/new-meeting/new-meeting.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environment';
import { DatePipe } from '@angular/common';
import { LoginService } from 'src/services/login/login.service';
import { Router } from '@angular/router';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';
import { LogoutPopupComponent } from './logout-popup/logout-popup.component';
import { AuthguardService } from 'src/services/authguard/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  create: boolean = false;
  userName: any = '';
  url: any = '';
  loginId: any = '';
  remainingMinutes: any = '';
  timeZone: any = '';
  sdkUrl: any;
  user: any;
  maintananceData: any;
  maintananceDiv = false;
  startDate: any;
  endDate: any;
  showDate: any;
  currentDate: any;
  message: any = ''
  profile: any = false
  email: any
  name: any
  PlanName: any
  ActivePlan = true
  expireDate: any
  planNameShow = true
  constructor(
    private popUp: MatDialog,
    private service: NewMeetingService,
    private datePipe: DatePipe,
    private loginService: LoginService,
    private router: Router,
    private meetinglistService: MeetinglistService,
    private Service: AuthguardService
  ) { }

  ngOnInit(): void {
    this.user = localStorage.getItem('displayName');
    // this.userName = this.userName.replace('mtn.', '')
    this.userName = localStorage.getItem('email');
    this.loginId = localStorage.getItem('loginId');
    this.timeZone = localStorage.getItem('timeZone');

    this.sdkUrl = environment.apiUrl;
    // this.checkMaintanance();
    // this.getProfileNotification()
    // this.routeSet()
    // this.mtnBundlePlanBalance()
  }

  sdkKey = 'D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU';
  // leaveUrl = 'http://localhost:4200/home/newMeeting'
  leaveUrl = "https://meetings.mtn.com/home/meeting-list"


  createMeeting() {
    this.create = true;
    this.popUp.open(LoadingSpinnerComponent);

    // const remaining = 2
    // const alert = remaining - 1
    // const alertSec = alert * 60000
    // const remainingSec = remaining * 60000

    // console.log("remaining>", remaining, "remainingSec >", remainingSec, "alert >", alert, "alertSec >", alertSec);
    this.service.checkHostbalance({ loginId: this.loginId }).subscribe(
      (res: any) => {
        console.log('res', res);
        this.remainingMinutes = res.data.RemainingMinutes;
        if (this.remainingMinutes > 1) {
          this.service.mtnUpdateUserLicense({ email: this.userName }).subscribe(
            (res: any) => {
              if (res.status == true) {
                this.service
                  .instantMeeting({
                    email: this.userName,
                    payload: {
                      timezone: this.timeZone,
                      topic: this.user + "'s Meeting",
                    },
                  })
                  .subscribe((res: any) => {
                    console.log(res, 'mtnUpdateUserLicense');

                    const paramData = {
                      signature: res.signature,
                      zoom_meeting_id: res.zoom_meeting_id,
                      password: res.password,
                      username: res.username,
                      email: res.email,
                      zak: res.zak,
                      remainingMinutes: this.remainingMinutes,
                    };

                    let data = JSON.stringify(paramData);
                    //  data = this.encryptData(data,"MtnSecretKey")
                    console.log(data);

                    // window.open(`${this.sdkUrl}`+'?data=' + data ,"_self")
                    // var newWindow = window.open(`${this.sdkUrl}`+'?data=' + data, '_blank', 'location=yes,left=250,top=100,height=570,width=850,scrollbars=yes,status=yes')

                    var newWindow = window.open(
                      `${this.sdkUrl}` + '?data=' + data,
                      '_self'
                    );
                    if (
                      !newWindow ||
                      newWindow.closed ||
                      typeof newWindow.closed == 'undefined'
                    ) {
                      // Pop-up is blocked, show a message or perform any other action
                      console.log(
                        'Pop-up is blocked. Please enable pop-ups for this site to use all features.'
                      );
                      window.alert(
                        'Pop-up is blocked. Please enable pop-ups for this site to use all features'
                      );
                    }

                    this.popUp.closeAll();
                  });
                // this.countdown(this.remainingMinutes)
              } else {
                this.popUp.closeAll();

                this.popUp.open(PopupComponent, {
                  width: '550px',
                  height: '300px',
                  data: { message: 'Unable to Start Meeting' },
                });
              }
            },
            (err) => {
              console.log(err);
              this.popUp.closeAll();

              this.popUp.open(PopupComponent, {
                width: '550px',
                height: '300px',
                data: { message: 'Server Down' },
              });
            }
          );
        } else {
          this.popUp.closeAll();

          this.popUp.open(PopupComponent, {
            width: '550px',
            height: '300px',
            data: {
              message: "You don't have a valid plan to start the meeting.",
            },
          });
        }
      },
      (err) => {
        console.log(err);
        this.popUp.closeAll();

        this.popUp.open(PopupComponent, {
          width: '550px',
          height: '300px',
          data: { message: 'Server Down' },
        });
      }
    );
  }

  // countdown(remainingMinutes) {

  //   const interval = setInterval(() => {
  //     remainingMinutes--;
  //     if (remainingMinutes == 5) {
  //       this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Remaining 5 mins" } })
  //     }

  //     if (remainingMinutes == 1) {
  //       this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Remaining 1 mins" } })
  //     }

  //     if (remainingMinutes <= 0) {
  //       clearInterval(interval);
  //       this.popUp.open(PopupComponent, {
  //         width: "600px", height: "300px",
  //         data: { message: "Your Meeting Ended due to insuffient Balance. Please Recharge your Account" }
  //       })
  //       console.log("Countdown finished!");
  //       ZoomMtg.endMeeting({
  //         success: function (res) {
  //           console.log('Meeting ended successfully');
  //         },
  //         error: function (res) {
  //           console.error(res);
  //         },
  //       });
  //     }

  //   }, 60000);
  // }

  encryptData(data: any, secretKey: string): string {
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();
    return ciphertext;
  }

  logout() {
    // localStorage.clear()
    // this.router.navigateByUrl("")
    this.popUp.open(LogoutPopupComponent, {
      width: '300px',
      height: '230px',

    });
  }

  checkMaintanance() {
    const data = { system: 'Angular' };
    this.service.checkVersionUpdate(data).subscribe((res: any) => {
      this.maintananceData = res.MAINTENANCE;
      this.message = this.maintananceData.message
      //getting the system local timezone
      const options = new Intl.DateTimeFormat().resolvedOptions();
      const timeZone = options.timeZone;

      const dateShow = new Date(this.maintananceData.date_show);
      // getting the current date
      const currentDate = new Date();
      const currentDateUtc = currentDate.toISOString();
      // Convert back to Date objects
      const startDate = new Date(dateShow);
      const endDate = new Date(currentDateUtc);

      // ------------------------------------------
      const showDate = startDate.toLocaleString(undefined, { timeZone });
      const currentDateNotfornatted = endDate.toLocaleString(undefined, {
        timeZone,
      });
      this.showDate = this.datePipe.transform(showDate, 'dd/MM/yyyy HH:mm');
      this.currentDate = this.datePipe.transform(
        currentDateNotfornatted,
        'dd/MM/yyyy HH:mm'
      );
      if (
        this.maintananceData.status == true &&
        this.currentDate >= this.showDate
      ) {
        this.maintananceDiv = true;
        const startDate = new Date(this.maintananceData.start_date);
        const endDate = new Date(this.maintananceData.end_date);
        const options = new Intl.DateTimeFormat().resolvedOptions();
        //getting the system local timezone
        const timeZone = options.timeZone;
        this.startDate = startDate.toLocaleString('en-US', {
          timeZone: timeZone,
        });
        this.endDate = endDate.toLocaleString('en-US', { timeZone: timeZone });
      } else {
        this.maintananceDiv = false;
      }
    });
  }
  closeNotificationDiv() {
    this.maintananceDiv = false;
  }
  // getProfileNotification(){
  //   this.loginService.getProfileRoute().subscribe((notification) => {
  //     console.log(notification, "notification");
  //     if (notification.profile == true) {
  //       this.profile = true
  //       this.router.navigateByUrl("home/profile")
  //     } else {
  //       this.profile = false
  //     }

  //   })
  // }
  // routeSet() {
  //   const route: any = localStorage.getItem('typeRoute')
  //   if (route == true) {
  //     console.log("profile");
  //     this.profile = true
  //     this.router.navigateByUrl("home/profile")
  //   } else {
  //     console.log("not profile");
  //     this.profile = false
  //     this.router.navigateByUrl("/home/meeting-list")
  //   }
  // }

  mtnBundlePlanBalance() {
    const data = { email: this.userName }
    console.log("data", data);
    this.meetinglistService.mtnBundlePlanBalance(data).subscribe((res: any) => {
      console.log("Plan Balance:---", res);
      this.ActivePlan = true
      this.PlanName = res.plan_name
      this.expireDate = res.date
      if (this.PlanName == '') {
        this.planNameShow = false
        this.PlanName = "30 Day plan"
      }
    }, err => {
      console.log("error", err);
      if (err.status = "402") {
        this.ActivePlan = false
        this.PlanName = "No Active Plan"
      }
      // this.service.logout()
    })
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

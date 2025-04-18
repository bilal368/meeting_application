import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MeetingDetailsComponent } from './meeting-details/meeting-details.component';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';

import { PopupComponent } from '../shared/popup/popup.component';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { environment } from 'src/environment';
import { NewMeetingService } from 'src/services/new-meeting/new-meeting.service';
import { LoginService } from 'src/services/login/login.service';


@Component({
  selector: 'app-meeting-list',
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.css']
})
export class MeetingListComponent implements OnInit {
  userName: any
  data: any
  meetingList: any
  currentDate: any
  currentTime: any
  signature: any
  zak: any
  loading: boolean = false
  recurrenceMeeting: any = []
  recurrenceMeetingList: any = []
  today: boolean = false
  reccurring: boolean = false
  userFormatedName: any = ''
  loginId: any = ''
  displayName: any
  remainingMinutes: any = ''

  RecurringClass: any
  nonRecurringClass: any
  nonReccurring: boolean = false
  reccuring: boolean = false

  user: any;
  create: boolean = false;
  timeZone: any
  sdkUrl: any
  PlanName: any
  ActivePlan = true
  expireDate: any
  planNameShow = true
  noReccurData: boolean = false
  reccurData: boolean = false
  headingType: any
  sdkKey = 'D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU'
  // leaveUrl = 'http://localhost:4200/home/meeting-list'
  leaveUrl = "https://meetings.mtn.com/home/meeting-list"

  // 
  joinMeetingDiv: any = false
  meetinglistDiv: any = true
  sheduleMettingDiv: any = false
  constructor(private popUp: MatDialog, private auth: MeetinglistService, private service: AuthguardService, private NewMeetingService: NewMeetingService, private loginService: LoginService, private meetinglistService: MeetinglistService) { }
  ngOnInit(): void {

    this.loginId = localStorage.getItem('loginId')
    this.displayName = localStorage.getItem('displayName')
    // this.userName = localStorage.getItem('userName')
    // this.userName = this.userName.replace('mtn.', '')
    this.userName = localStorage.getItem('email')
    this.headingType = localStorage.getItem('headingType')
    this.timeZone = localStorage.getItem('timeZone')
    this.getProfileNotification()
    if (this.headingType == undefined) {
      this.toggleClasses('nonrecurring')
    } else if (this.headingType == "recurring") {
      this.toggleClasses('recurring')
    } else {
      this.toggleClasses('nonrecurring')
    }
    this.listMeetings()
    // this.getMeetingList()
    // this.getCurrentDateTime()
    // this.listRecurringMeeting()

    this.auth.reload.subscribe(() => {
      // this.getMeetingList()
      // this.listRecurringMeeting()
      this.listMeetings()

    })
    // this.networkError()
    this.mtnBundlePlanBalance()
    this.sdkUrl = environment.apiUrl;
  }

  openMeetingDetails(id: any, date: any) {
    console.log(date);
    this.popUp.open(MeetingDetailsComponent, { width: "70vh", height: "auto", disableClose: true, data: { id: id, date: date } })
  }

  toggleClasses(type: any) {
    if (type == "recurring") {
      this.RecurringClass = 'tabLabel2'
      this.nonRecurringClass = 'tabLabel'
      this.reccuring = true
      this.nonReccurring = false
      localStorage.setItem('headingType', "recurring")
    } else {
      this.RecurringClass = 'tabLabel'
      this.nonRecurringClass = 'tabLabel2'
      this.reccuring = false
      this.nonReccurring = true
      localStorage.setItem('headingType', "nonRecurring")
    }
  }

  getMeetingList() {
    this.loading = true
    this.data = { email: this.userName }
    this.auth.meetingList(this.data).subscribe((res: any) => {
      this.meetingList = res.scheduledMeeting
      if (this.meetingList.length == 0) {
        this.noReccurData = true
      } else {
        this.noReccurData = false
      }
      this.loading = false
    }, err => {
      if (err.status = 401) {
        // this.service.logout()
      }
      else {
        this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
      }
    })
  }
  areDetailsEqual(details1: any, details2: any) {
    return details1.created_at === details2.created_at && details1.duration === details2.duration;
  }
  // listRecurringMeeting() {
  //   this.recurrenceMeetingList = []
  //   this.auth.listRecurringMeeting({ email: this.userName }).subscribe((res: any) => {
  //     this.recurrenceMeeting = res.recurrenceMeeting
  //     for (let i = 0; i < res.recurrenceMeeting.length; i++) {
  //       if (res.recurrenceMeeting[i].length > 0) {
  //         const currentDetails = res.recurrenceMeeting[i][0];
  //         if (!this.recurrenceMeetingList.some((existingDetails: any) => this.areDetailsEqual(existingDetails, currentDetails))) {
  //           this.recurrenceMeetingList.push(currentDetails);
  //         }
  //       }
  //     }
  //     if (this.recurrenceMeetingList.length == 0) {
  //       this.reccurData = true
  //     } else {
  //       this.reccurData = false
  //     }

  //     this.loading = false
  //     if (res.recurrenceMeeting.length != "0") {
  //       this.reccurring = true
  //     } else {
  //       this.reccurring = false
  //     }
  //   }, err => {
  //     if (err.status = 401) {
  //       // this.service.logout()
  //     }
  //     else {
  //       this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
  //     }
  //   })
  // }
  groupedMeetings: any
  groupNormalMeetings:any
  listMeetings() {
    this.recurrenceMeetingList = [];
    this.loading = true;
    this.data = { email: this.userName };
    this.auth.listMeetings(this.data).subscribe((res: any) => {
      console.log(res, "listMeetings from resp");
      this.recurrenceMeetingList = res.recurrenceMeeting.flat();
      this.recurrenceMeetingList = this.recurrenceMeetingList.sort((a: any, b: any) => {
        const dateA = new Date(a.start_time).getTime();
        const dateB = new Date(b.start_time).getTime();
        return dateA - dateB;
      });
      console.log(this.recurrenceMeetingList,"sorted");
      this.groupedMeetings = this.groupMeetingsByDate(this.recurrenceMeetingList);
      console.log(this.groupedMeetings,"grouped");
      this.loading = false;
      this.meetingList = res.normalMeeting
      this.groupNormalMeetings=this.groupMeetingsByDate(this.meetingList);
      console.log(this.groupNormalMeetings);
      if (this.meetingList.length == 0) {
        this.noReccurData = true
      } else {
        this.noReccurData = false
      }
      this.loading = false
      // for (let i = 0; i < res.recurrenceMeeting.length; i++) {
      //   if (res.recurrenceMeeting[i].length > 0) {
      //     const currentDetails = res.recurrenceMeeting[i][0];
      //     if (!this.recurrenceMeetingList.some((existingDetails: any) => this.areDetailsEqual(existingDetails, currentDetails))) {
      //       this.recurrenceMeetingList.push(currentDetails);
      //     }
      //   }
      // }
      if (this.recurrenceMeetingList.length == 0) {
        this.reccurData = true
      } else {
        this.reccurData = false
      }
      if (res.recurrenceMeeting.length != "0") {
        this.reccurring = true
      } else {
        this.reccurring = false
      }
    }, err => {
      if (err.status = 401) {
        this.loading = false
        this.popUp.closeAll()
        this.service.logout()
      }
      else {
        this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: err.error.message } })
      }
    })
  }
  getCurrentDateTime() {

    const updateDateTime = () => {
      const currentDateTime = new Date();
      const timeZone = this.timeZone
      this.currentDate = currentDateTime.toLocaleDateString(undefined, { timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      this.currentTime = currentDateTime.toLocaleTimeString(undefined, { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // this.currentDate = currentDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      // this.currentTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    };

    // Update the date and time immediately
    updateDateTime();

    // Update the date and time every second (adjust the interval as needed)
    setInterval(updateDateTime, 1000);
  }

  joinMeeting(data: any) {
    this.popUp.open(LoadingSpinnerComponent)

    // const remaining = 2
    // const alert = remaining - 1
    // const alertSec = alert * 60000
    // const remainingSec = remaining * 60000
    this.loading = true
    this.auth.checkHostbalance({ loginId: this.loginId }).subscribe((res: any) => {
      this.remainingMinutes = res.data.RemainingMinutes
      if (this.remainingMinutes > 1) {
        this.auth.mtnUpdateUserLicense({ email: this.userName }).subscribe((respo: any) => {
          if (respo.status == true) {
            this.loading = false
            this.auth.signature({ role: "1", meetingNumber: data }).subscribe((response: any) => {
              this.signature = response.signature
              this.zak = response.zak
            }, err => {
              if (err.status = 401) {
                this.loading = false
                // this.service.logout()
              }
              else {
                this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
              }
            })

            this.auth.getMeetingDetailsByMeetingId({ meetingId: data }).subscribe((res: any) => {
              this.loading = false

              this.userFormatedName = res.meeting.host_email.replace('mtn.', '')

              const data = {
                signature: this.signature, zoom_meeting_id: res.meeting.id, password: res.meeting.password,
                username: this.displayName, email: res.meeting.host_email, zak: this.zak, remainingMinutes: this.remainingMinutes
              }
              const dataString = JSON.stringify(data)
              // window.open(`${this.sdkUrl}` + '?data=' + dataString)

              // var newWindow = window.open(`${this.sdkUrl}` + '?data=' + dataString)
              var newWindow = window.open(`${this.sdkUrl}` + '?data=' + dataString, "_self")

              if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                // Pop-up is blocked, show a message or perform any other action
                window.alert("Pop-up is blocked. Please enable pop-ups for this site to use all features")
              }

              this.popUp.closeAll()

            }, err => {
              if (err.status = 401) {
                this.loading = false
                this.popUp.closeAll()
                // this.service.logout()
              }
              else {
                this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
              }
            })

            // this.countdown(this.remainingMinutes)
          } else {
            this.popUp.closeAll()

            this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Unable to Start Meeting" } })
          }
        }, err => {
          this.loading = false
          this.popUp.closeAll()
          // this.service.logout()
          this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
        })

      } else {
        this.popUp.closeAll()
        this.loading = false
        this.popUp.open(PopupComponent, { width: "550px", height: "200px", data: { message: "You don't have a valid plan to start the meeting." } })
      }
    }, err => {
      if (err.status = 401) {
        this.loading = false
        this.popUp.closeAll()
        this.service.logout()
      }
      else {
        this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
      }
    })
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
  //         width: "550px", height: "300px",
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


  popupIsOpen: boolean = false;

  networkError() {
    // Check if the popup is already open
    if (this.popupIsOpen) {
      return; // If open, do nothing
    }

    this.service.isOnline().subscribe((resp) => {
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


  // createMeeting() {
  //   this.create = true;
  //   this.popUp.open(LoadingSpinnerComponent);
  //   console.log(this.loginId, "checkHostbalance");
  //   this.NewMeetingService.checkHostbalance({ loginId: this.loginId }).subscribe(
  //     (res: any) => {
  //       console.log('res', res);
  //       this.remainingMinutes = res.data.RemainingMinutes;
  //       if (this.remainingMinutes > 1) {
  //         console.log(this.userName, "mtnUpdateUserLicense");
  //         this.NewMeetingService.mtnUpdateUserLicense({ email: this.userName }).subscribe(
  //           (res: any) => {
  //             if (res.status == true) {
  //               this.NewMeetingService
  //                 .instantMeeting({
  //                   email: this.userName,
  //                   payload: {
  //                     timezone: this.timeZone,
  //                     topic: this.user + "'s Meeting",
  //                   },
  //                 })
  //                 .subscribe((res: any) => {
  //                   console.log(res, 'mtnUpdateUserLicense');

  //                   const paramData = {
  //                     signature: res.signature,
  //                     zoom_meeting_id: res.zoom_meeting_id,
  //                     password: res.password,
  //                     username: res.username,
  //                     email: res.email,
  //                     zak: res.zak,
  //                     remainingMinutes: this.remainingMinutes,
  //                   };

  //                   let data = JSON.stringify(paramData);
  //                   //  data = this.encryptData(data,"MtnSecretKey")
  //                   console.log(data);

  //                   // window.open(`${this.sdkUrl}`+'?data=' + data ,"_self")
  //                   // var newWindow = window.open(`${this.sdkUrl}`+'?data=' + data, '_blank', 'location=yes,left=250,top=100,height=570,width=850,scrollbars=yes,status=yes')

  //                   var newWindow = window.open(
  //                     `${this.sdkUrl}` + '?data=' + data,
  //                     '_self'
  //                   );
  //                   if (
  //                     !newWindow ||
  //                     newWindow.closed ||
  //                     typeof newWindow.closed == 'undefined'
  //                   ) {
  //                     // Pop-up is blocked, show a message or perform any other action
  //                     console.log(
  //                       'Pop-up is blocked. Please enable pop-ups for this site to use all features.'
  //                     );
  //                     window.alert(
  //                       'Pop-up is blocked. Please enable pop-ups for this site to use all features'
  //                     );
  //                   }

  //                   this.popUp.closeAll();
  //                 });
  //               // this.countdown(this.remainingMinutes)
  //             } else {
  //               this.popUp.closeAll();

  //               this.popUp.open(PopupComponent, {
  //                 width: '400px',
  //                 height: '200px',
  //                 data: { message: 'Unable to Start Meeting' },
  //               });
  //             }
  //           },
  //           (err) => {
  //             console.log(err, "mtnUpdateUserLicense");
  //             this.popUp.closeAll();

  //             this.popUp.open(PopupComponent, {
  //               width: '350px',
  //               height: '200px',
  //               data: { message: 'Server Down' },
  //             });
  //           }
  //         );
  //       } else {
  //         this.popUp.closeAll();

  //         this.popUp.open(PopupComponent, {
  //           width: '500px',
  //           height: '300px',
  //           data: {
  //             message: "You don't have a valid plan to start the meeting!!",
  //           },
  //         });
  //       }
  //     },
  //     (err) => {
  //       console.log(err, "checkHostbalance");
  //       this.popUp.closeAll();

  //       this.popUp.open(PopupComponent, {
  //         width: '350px',
  //         height: '200px',
  //         data: { message: 'Server Down' },
  //       });
  //     }
  //   );
  // }

  createMeeting() {
    this.create = true;
    this.popUp.open(LoadingSpinnerComponent);
    // console.log(this.loginId,this.userName, "this.loginId","this.userName");
    if (this.loginId && this.userName) { // Add null checks for this.loginId and this.userName
      this.NewMeetingService.checkHostbalance({ loginId: this.loginId }).subscribe(
        (res: any) => {
          this.remainingMinutes = res.data.RemainingMinutes;

          if (this.remainingMinutes > 1) {

            // Add null check for this.userName
            this.NewMeetingService.mtnUpdateUserLicense({ email: this.userName }).subscribe(
              (res: any) => {
                if (res.status == true) {
                  this.NewMeetingService
                    .instantMeeting({
                      email: this.userName,
                      payload: {
                        timezone: this.timeZone,
                        topic: this.displayName + "'s Meeting",
                      },
                    })
                    .subscribe((res: any) => {

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

                      var newWindow = window.open(
                        `${this.sdkUrl}` + '?data=' + data,
                        '_self'
                      );

                      if (
                        !newWindow ||
                        newWindow.closed ||
                        typeof newWindow.closed == 'undefined'
                      ) {
                        window.alert(
                          'Pop-up is blocked. Please enable pop-ups for this site to use all features'
                        );
                      }

                      this.popUp.closeAll();
                    });
                } else {
                  this.popUp.closeAll();
                  this.popUp.open(PopupComponent, {
                    width: '400px',
                    height: '200px',
                    data: { message: 'Unable to Start Meeting' },
                  });
                }
              },
              (err) => {
                this.popUp.closeAll();
                if (err.status = 401) {
                  this.loading = false
                  this.popUp.closeAll()
                  // this.service.logout()
                }
                else {
                  this.popUp.open(PopupComponent, {
                    width: '350px',
                    height: '200px',
                    data: { message: err.error.message },
                  });
                }
              }
            );
          } else {
            this.popUp.closeAll();
            this.popUp.open(PopupComponent, {
              width: '550px',
              height: '200px',
              data: {
                message: "You don't have a valid plan to start the meeting",
              },
            });
          }
        },
        (err) => {
          this.popUp.closeAll();
          if (err.status = 401) {
            this.loading = false
            this.popUp.closeAll()
            this.service.logout()
          }
          else {
            this.popUp.open(PopupComponent, {
              width: '350px',
              height: '200px',
              data: { message: err.error.message },
            });
          }
        }
      );
    } else {
      console.error("Invalid values for loginId or userName");
    }
  }

  switchDivs(name: any) {
    if (name == "joinMeeting") {
      this.joinMeetingDiv = true
      this.meetinglistDiv = false
      this.sheduleMettingDiv = false
    } else if (name == "sheduleMeeting") {
      this.joinMeetingDiv = false
      this.meetinglistDiv = false
      this.sheduleMettingDiv = true
    }
  }

  setProfileNotification(type: any) {
    this.loginService.setProfileRoute(type)
  }

  getProfileNotification() {
    this.loginService.getProfileRoute().subscribe((notification) => {
      if (notification.profile == true) {
        this.joinMeetingDiv = false
        this.meetinglistDiv = true
        this.sheduleMettingDiv = false
        this.listMeetings()
        // this.getMeetingList()
        // this.listRecurringMeeting()
      } else {

      }

    })
  }
  upcomingplans: any
  mtnBundlePlanBalance() {
    const data = { email: this.userName }
    this.meetinglistService.mtnBundlePlanBalance(data).subscribe((res: any) => {
      console.log(res, "mtnBundlePlanBalance");
      this.ActivePlan = true
      this.expireDate = res.date
      this.upcomingplans = res.upcomingStatus
      if (res.plan_name == '') {
        this.planNameShow = false
        this.PlanName = "Meetings⁺"
      } else if (res.message == "No active plans available.") {
        this.ActivePlan = false
        this.PlanName = "No Active Plan"
        localStorage.setItem('plandetails', JSON.stringify("No Active Plan"));

      }
      else {
        const planNameSuffix = res.plan_name;
        this.PlanName = `Meetings⁺ ${planNameSuffix}`;
      }
      const planDetails = { planName: this.PlanName, expireDate: this.expireDate, count: this.upcomingplans };
      localStorage.setItem('plandetails', JSON.stringify(planDetails));
    }, err => {
      console.log(err);

      if (err.status = "402") {
        this.ActivePlan = false
        this.PlanName = "No Active Plan"
      }
    })
  }

  isTodayOrTomorrow(date: string): string | null {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Parse the 'dd-MM-yyyy' format into a Date object
    const [day, month, year] = date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
    if (
      startDate.getDate() === today.getDate() &&
      startDate.getMonth() === today.getMonth() &&
      startDate.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    } else if (
      startDate.getDate() === tomorrow.getDate() &&
      startDate.getMonth() === tomorrow.getMonth() &&
      startDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow';
    }

    return null; // Return null if the date is neither today nor tomorrow
  }
  
//   groupMeetingsByDate(meetings:any) {
//     const groupedMeetings = meetings.reduce((acc:any, meeting:any) => {
//       const meetingDate = new Date(meeting.start_time).toLocaleDateString('en-GB', {
//         timeZone: meeting.timezone || 'UTC',  // ensure correct timezone
//       });
//       if (!acc[meetingDate]) {
//         acc[meetingDate] = [];
//       }
//       acc[meetingDate].push(meeting);
//       return acc;
//     }, {});
  
//     return Object.keys(groupedMeetings).map(date => ({
//       date,
//       meetings: groupedMeetings[date]
//     }));
// }
groupMeetingsByDate(meetings: any) {
  const groupedMeetings = meetings.reduce((acc: any, meeting: any) => {
    // Convert start_time to local time
    const meetingDate = new Date(meeting.start_time);

    // Ensure the time zone is correctly applied
    const timeZone = meeting.timezone || 'UTC';
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone
    };
    
    // Convert the date to a string in the correct format
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(meetingDate);
    // Convert 'dd/MM/yyyy' to 'dd-MM-yyyy'
    const [day, month, year] = formattedDate.split('/');
    const finalDate = `${day}-${month}-${year}`;

    if (!acc[finalDate]) {
      acc[finalDate] = [];
    }
    acc[finalDate].push(meeting);
    return acc;
  }, {});

  return Object.keys(groupedMeetings).map(date => ({
    date,
    meetings: groupedMeetings[date]
  }));
}
}
// groupMeetingsByDate(meetings: any[]): { date: string, meetings: any[] }[] {
//   const grouped = meetings.reduce((acc: any, meeting: any) => {
//     const dateObj = new Date(meeting.start_time); 
//     const dateKey = `${('0' + dateObj.getDate()).slice(-2)}-${('0' + (dateObj.getMonth() + 1)).slice(-2)}-${dateObj.getFullYear()}`;
//     if (!acc[dateKey]) {
//       acc[dateKey] = [];
//     }
//     acc[dateKey].push(meeting);
//     return acc;
//   }, {});

//   return Object.keys(grouped).map(date => ({
//     date,
//     meetings: grouped[date]
//   }));
// }
// }

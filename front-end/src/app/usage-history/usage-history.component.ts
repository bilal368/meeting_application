import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';
import { PopupComponent } from '../shared/popup/popup.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewSummaryDetailsComponent } from './view-summary-details/view-summary-details.component';
@Component({
  selector: 'app-usage-history',
  templateUrl: './usage-history.component.html',
  styleUrls: ['./usage-history.component.css']
})
export class UsageHistoryComponent {

  loginId: any
  userName: any
  meetingHistory: any = []
  noData: boolean = false
  expireDate: any
  PlanName: any
  planNameShow = true
  ActivePlan = true
  selectedTab: any = 'purchaseHistory'
  usageHistory: any = true
  purchaseHistory = false
  loginedUserName: any

  phoneNumber: any
  timeZone: any
  email: any
  purchaseHistoryData: any = []
  convertedPurchaseHistory: any
  noPurchaseData: any


  constructor(private router: Router, private meetinglistService: MeetinglistService, private popUp: MatDialog, private service: AuthguardService, private clipboard: Clipboard, private snackbar: MatSnackBar,) { }

  ngOnInit(): void {

    this.loginId = localStorage.getItem('loginId')

    this.loginedUserName = localStorage.getItem('displayName')
    // this.userName = this.userName.replace('mtn.', '')
    // this.UserName=localStorage.getItem('userName')
    this.userName = localStorage.getItem('email')
    // this.networkError()
    this.getFromlocalstorage()
    this.getDefaultValues()
    this.mtnMeetingHistoryForUser()
    this.mtnBundlePlanBalance()
    this.getPurchaseHistory()
    this.getRoute()
    this.getUpdateNotification()


  }

  route() {
    this.router.navigateByUrl('/home/meeting-list')
  }


  mtnMeetingHistoryForUser() {
    const data={timezone: this.timeZone, username: this.userName}
    this.meetinglistService.mtnMeetingHistoryForUser(data).subscribe(
      (res: any) => {
        if (res.meetingHistory && Array.isArray(res.meetingHistory)) {
          // Format startTime and update meetingTopic if necessary
          this.meetingHistory = res.meetingHistory.map((meeting: any) => {
            if (meeting.startTime) {
              const isoDate = new Date(meeting.startTime);
              const formattedStartTime = isoDate.toISOString().slice(0, 16).replace('T', ' ');
              return { ...meeting, startTime: formattedStartTime };
            }
            return meeting;
          });

          // Adjust meetingTopic if it matches "undefined's Meeting"
          for (let i = 0; i < this.meetingHistory.length; i++) {
            if (this.meetingHistory[i].meetingTopic === "undefined's Meeting") {
              this.meetingHistory[i].meetingTopic = `${this.loginedUserName}'s Meeting`;
            }
          }

          // Check if meetingHistory is empty
          this.noData = this.meetingHistory.length === 0;

          console.log(this.meetingHistory, "this.meetingHistory");
        } else {
          // Handle case where meetingHistory is not an array or undefined
          console.error('Invalid or empty meeting history:', res.meetingHistory);
          this.noData = true; // Set noData flag to true
        }
      },
      (err) => {
        if (err.status == 504) {
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
        } else if (err.status == 401) {
          this.service.logout()
        } else if (err.error.message == "Data not found") {
          console.log("no data");
          
        }
        else {
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
        }
      }
    );
  }
  upcomingplans: any
  mtnBundlePlanBalance() {
    // const data = { email: this.userName }
    // console.log("data", data);
    // this.meetinglistService.mtnBundlePlanBalance(data).subscribe((res: any) => {
    //   console.log("Plan Balance:---", res);
    //   this.ActivePlan = true
    //   this.expireDate = res.date
    //   if (res.plan_name == '') {
    //     this.planNameShow = false
    //     this.PlanName = "Meetings⁺"
    //   } else {
    //     const planNameSuffix = res.plan_name;
    //     this.PlanName = `Meetings⁺ ${planNameSuffix}`;
    //   }
    // }, err => {
    //   console.log("error", err);
    //   if (err.status = "402") {
    //     this.ActivePlan = false
    //     this.PlanName = "No Active Plan"
    //   }
    // })
    const storedPlanDetails = localStorage.getItem('plandetails');
    if (storedPlanDetails) {
      // Parse the JSON string back into an object
      const planDetails = JSON.parse(storedPlanDetails);
      // Use the retrieved plan details
      this.PlanName = planDetails.planName;
      this.expireDate = planDetails.expireDate;
      this.upcomingplans = planDetails.count
      console.log('Retrieved Plan Details:', planDetails);
      console.log(this.PlanName);
      if (this.PlanName == "No Active Plan") {
        this.ActivePlan = false
      } else {
        this.ActivePlan = true

      }
    } else {
      // this.PlanName = "No Active Plan"
    }
  }

  selectTab(name: any) {
    this.selectedTab = name;
    switch (name) {
      case 'usageHistory':
        this.selectedTab = 'usageHistory';
        this.purchaseHistory = false
        this.usageHistory = true
        document.title = 'Meetings⁺ Usage History';
        break;
      case 'purchaseHistory':
        this.selectedTab = 'purchaseHistory';
        this.purchaseHistory = true
        this.usageHistory = false
        document.title = 'Meetings⁺ Purchase History';
        break;
    }

  }


  getPurchaseHistory() {
    const data = { limit: "50", timezone: this.timeZone, phone: this.phoneNumber, email: this.email }
    this.meetinglistService.mtnPurchaseHistory(data).subscribe((res: any) => {
      console.log(res, "getPurchaseHistory");
      this.purchaseHistoryData = res.Bundleplans
      this.dateConvertion(res.Bundleplans)
      if (this.purchaseHistoryData.length <= 0) {
        this.noPurchaseData = true
      } else {
        this.noPurchaseData = false
      }
    },
      (err) => {
        console.log(err);

        if (err.status == 504) {
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
        } else if (err.status == 401) {
          this.service.logout()
        } else if (err.error.message == "Data not found") {
          this.noPurchaseData = true
        }
        else {
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
        }
      }
    );
  }

  getFromlocalstorage() {
    this.timeZone = localStorage.getItem('timeZone')
    this.phoneNumber = localStorage.getItem('phoneNumber')
    this.email = localStorage.getItem('email')


  }
  // convertToTimeZone(dateString: any) {
  //   // Check if dateString is a valid string
  //   if (typeof dateString === 'string' || dateString instanceof String) {
  //     const formattedDate = dateString.replace('T', ' ').replace('Z', '');
  //     return formattedDate;
  //   } else {
  //     return dateString;
  //   }
  // }

  convertToTimeZone(dateString: any) {
    // Check if dateString is a valid string
    if (typeof dateString === 'string' || dateString instanceof String) {
      // Split the date string at 'T' to separate date and time
      const [datePart, timePart] = dateString.split('T');
      // Remove the 'Z' from the time part (if it exists)
      const formattedTime = timePart?.replace('Z', '');
      // Combine date and time parts
      return `${datePart} ${formattedTime}`;
    } else {
      return dateString;
    }
  }

  dateConvertion(data: any) {
    console.log(data, "function");
    this.convertedPurchaseHistory = data.map((item: any) => {
      return {
        ...item,
        bundleExpiryDateAndTIme: this.convertToTimeZone(item.bundleExpiryDateAndTIme),
        bundlePurchaseDate: this.convertToTimeZone(item.bundlePurchaseDate),
        bundleStartDate: this.convertToTimeZone(item.bundleStartDate),
      };
    });
    console.log(this.convertedPurchaseHistory, "converted date data");


  }
  getDefaultValues() {
    const path = localStorage.getItem('path')
    if (path == 'Usage') {
      this.selectedTab = 'usageHistory';
      this.purchaseHistory = false
      this.usageHistory = true
      document.title = 'Meetings⁺ Usage History';
    } else if (path == 'Purchase') {
      this.selectedTab = 'purchaseHistory';
      this.purchaseHistory = true
      this.usageHistory = false
      document.title = 'Meetings⁺ Purchase History';
    }
  }
  getRoute() {
    this.meetinglistService.getRoute().subscribe((route) => {
      console.log(route, "notification");
      if (route.route == "Usage") {
        this.selectedTab = 'usageHistory';
        this.purchaseHistory = false
        this.usageHistory = true
        document.title = 'Meetings⁺ Usage History';
      } else if (route.route == "Purchase") {
        this.selectedTab = 'purchaseHistory';
        this.purchaseHistory = true
        this.usageHistory = false
        document.title = 'Meetings⁺ Purchase History';
      }
    })
  }
  getUrl(data: any) {
    console.log(data, "URL");

  }

  getPlayUrl(meetingId: any) {
    console.log(meetingId);
    for (const data of this.meetingHistory) {
      if (data.meetingId === meetingId) {
        if (data.shared_screen_with_speaker_view && data.shared_screen_with_speaker_view.length > 0) {
          const sharedScreenJson = JSON.parse(data.shared_screen_with_speaker_view);
          console.log(data.shared_screen_with_speaker_view, "data.shared_screen_with_speaker_view");
          const playUrl = sharedScreenJson[0].play_url;
          console.log(playUrl, "playUrl");
          // const substringToRemove = "https://us06web.zoom.us/rec/play/";
          // const Url = playUrl.replace(substringToRemove, "");
          // const paramsValue=Url
          // const modifiedUrl = `play/${paramsValue}`;
          // this.router.navigate(['play', modifiedUrl]);
          window.open(playUrl, '_blank');
          return data.shared_screen_with_speaker_view[0].play_url;
        } else {
          return null; // or handle empty shared_screen_with_speaker_view as needed
        }
      }
    }
  }

  copyPassword(password: string) {
    this.clipboard.copy(password);
    this.snackbar.open('Passcode copied to clipboard', 'Dismiss', { duration: 2000 });

  }
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

  openViewSummary(data: any) {
    const summarydata = { summary_Details: data.summary_Details, summary_overview: data.summary_overview, summary_title: data.summary_title, uuid: data.uuid }
    this.popUp.open(ViewSummaryDetailsComponent, { width: "700px", height: "620px", data: { data: summarydata }, disableClose: true })

  }
  getUpdateNotification() {
    this.meetinglistService.getUpdateNotification().subscribe((notification: any) => {
      console.log(notification, "notification get");
      if (notification.notification == true) {
        this.mtnMeetingHistoryForUser()
      }

    })
  }
}

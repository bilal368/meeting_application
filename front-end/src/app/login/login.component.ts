import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from 'src/services/login/login.service';
import { PopupComponent } from '../shared/popup/popup.component';
import { MatDialog } from '@angular/material/dialog';
import { JoinMeetingService } from 'src/services/joinMeeting/join-meeting.service';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { environment } from 'src/environment';
import * as CryptoJS from 'crypto-js'
import { PasswordRetryComponent } from './password-retry/password-retry.component';
import { NewMeetingService } from 'src/services/new-meeting/new-meeting.service';
import { DatePipe } from '@angular/common';
import { MaintananceComponent } from '../maintanance/maintanance.component';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  LoginForm!: FormGroup
  joinForm!: FormGroup
  recoveryForm!: FormGroup

  landingPage = true
  login = false
  joinMeeting = false
  launchPage = false
  token: any
  userNotFound = false
  Message: any
  loginId: any = ''
  meetingId: any = ''
  password: any = ''
  userName: any = ''
  url: any = ''
  forgot: any
  sdkUrl: any
  secretKey: any
  maintananceData: any
  startDate: any
  formattedDate: any
  maintananceDiv = false;
  endDate: any;
  showDate: any;
  currentDate: any;
  message: any = ''
  secondsLeft: any

  hide: boolean = true;
  forgotPassword: boolean = false

  constructor(private fb: FormBuilder, private router: Router, private auth: LoginService, private popUp: MatDialog, private JoinMeetingService: JoinMeetingService,
    private ActivatedRoute: ActivatedRoute, private service: AuthguardService, private newMeetingService: NewMeetingService, private datePipe: DatePipe,
    private snackBar: MatSnackBar) {
    this.LoginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })

    this.joinForm = this.fb.group({
      meetingId: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      displayName: ['', Validators.required],
      password: ['', Validators.required]
    })

    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // const currentHost = window.location.host;
    // // Determine the protocol based on the current environment
    // const protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
    // // Construct the new URL with the dynamic host and protocol
    //  this.url = protocol + currentHost + '/';
    // // Use the new URL
    // console.log( this.url);

  }


  email = new FormControl('', [Validators.required, Validators.email]);


  ngOnInit(): void {
    this.detectOs()
    // this.ExtractUrl()
    this.getUrlData()
    // this.networkError()

    this.sdkUrl = environment.apiUrl;
    this.secretKey = environment.secretKey

    if (!this.joinMeeting) {
      if (localStorage.getItem('L_Data') != null) {
        this.ifAllreadyLoggedIn()
      }
    }

    this.checkMaintanance()
    this.checkMaintananceDiv()
  }

  getUrlData() {
    this.ActivatedRoute.queryParams.subscribe(params => {
      const type = params['type'];
      const meetingNo = params['meetingNo'];
      const pwd = params['pwd'];

      if (type == "join") {
        if (this.os == "Windows") {
          localStorage.clear()
          this.joinMeeting = false
          this.landingPage = false
          this.login = false
          this.launchPage = true
          this.meetingId = meetingNo
          this.password = pwd
          this.joinForm.patchValue({
            meetingId: meetingNo,
            password: pwd
          })
        }
        else {
          localStorage.clear()
          this.joinMeeting = true
          this.landingPage = false
          this.login = false
          // this.launchPage = true
          this.meetingId = meetingNo
          this.password = pwd
          this.joinForm.patchValue({
            meetingId: meetingNo,
            password: pwd
          })

        }
      } else {
        this.router.navigateByUrl('/login')
      }
    });

    console.log(" this.joinMeeting ", this.joinMeeting);


  }

  enablForgot() {
    // this.router.navigateByUrl('/getResetForm')
    this.forgotPassword = true
    this.login = false
    this.landingPage = false
    document.title = 'Meetings⁺ Forgot password';
    this.LoginForm.patchValue({
      email: '',
      password: ''
    })
  }

  EnableLogin() {
    this.login = true
    this.forgot = false
    this.joinMeeting = false
    this.landingPage = false
    this.forgotPassword = false
    document.title = 'Meetings⁺ Login';
    this.recoveryForm.reset()
  }

  sdkKey = 'D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU'
  // leaveUrl = 'http://localhost:4200/'
  leaveUrl = 'https://meetings.mtn.com/'

  showPassword() {
    var x = document.getElementById("passwordInput") as HTMLInputElement;
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  joinmeeting() {
    this.joinMeeting = true
    this.landingPage = false
    this.login = false
    this.forgotPassword = false
    this.LoginForm.reset()
    this.recoveryForm.reset()
    document.title = 'Meetings⁺ Join';
  }

  Login() {
    this.login = true
    this.joinMeeting = false
    this.landingPage = false
    this.joinForm.reset()
    document.title = 'Meetings⁺ Login';
  }

  cancel() {
    this.login = false
    this.joinMeeting = false
    this.landingPage = true
    this.joinForm.reset()
  }

  signIn() {
    console.log(this.LoginForm.value)
    const email = this.LoginForm.value.email.trim();
    const password = this.LoginForm.value.password.trim();
    if (!email && !password) {
      this.popUp.open(PopupComponent, { width: "350px", height: "250px", data: { message: "Please fill in all fields." } });
    } else if (!email) {
      this.popUp.open(PopupComponent, { width: "350px", height: "250px", data: { message: "Please enter your email." } });
    } else if (!password) {
      this.popUp.open(PopupComponent, { width: "400px", height: "250px", data: { message: "Please enter your password." } });
    }
    else {
      this.popUp.open(LoadingSpinnerComponent)
      const loginDetails = { email: this.LoginForm.value.email, password: this.LoginForm.value.password }
      const encryptedLoginDetails = this.encrypt(loginDetails)
      this.auth.login(this.LoginForm.value).subscribe((res: any) => {
        console.log(res, "login");
        this.token = res.token
        if (res.status == "User found") {
          this.Message = ''
          this.popUp.closeAll()
          localStorage.setItem('L_Data', encryptedLoginDetails)
          localStorage.setItem("userName", res.Data[0].username)
          localStorage.setItem('email', res.email_user)
          localStorage.setItem("displayName", res.username)
          localStorage.setItem('token', this.token)
          localStorage.setItem('loginId', res.Data[0].loginId)
          localStorage.setItem('timeZone', res.timezone)
          localStorage.setItem('phoneNumber', res.phone)
          this.router.navigateByUrl('/home/meeting-list')
        }
        else if (res.status == false) {
          this.popUp.closeAll()
          this.popUp.open(PasswordRetryComponent, { width: "450px", height: "100px", data: { seconds: res.seconds }, disableClose: true })
        }
        else if (res.status == "User not found") {
          this.popUp.closeAll()
          this.Message = "Invalid Email or Password"
          this.userNotFound = true
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: this.Message } })
        }
      }, err => {
        console.log("error", err);
        if (err.status == 429) {
          this.popUp.closeAll()
          this.popUp.open(PasswordRetryComponent, { width: "450px", height: "100px", data: { seconds: err.error.seconds }, disableClose: true })
        } else if (err.status == 504) {
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
        } else {
          this.popUp.closeAll()
          this.Message = err.error.message;
          this.userNotFound = true
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: this.Message } })

        }
      })
    }
  }

  ifAllreadyLoggedIn() {
    this.popUp.open(LoadingSpinnerComponent)

    const data = localStorage.getItem('L_Data')
    const decryptedData = this.decrypt(data)
    console.log(decryptedData);

    this.auth.login(decryptedData).subscribe((res: any) => {
      console.log(res);
      this.popUp.closeAll()
      this.router.navigateByUrl('/home/meeting-list')

    }, err => {
      localStorage.clear()
      this.popUp.closeAll()
      this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: err.error.message } })
    })
  }

  joinMeetingByLink() {

    this.meetingId = this.joinForm.value.meetingId
    this.password = this.joinForm.value.password
    this.userName = this.joinForm.value.displayName
    this.popUp.open(LoadingSpinnerComponent)


    if (this.userName != '') {
      this.auth.joinMeeting({ role: "0", meetingNumber: this.meetingId }).subscribe((res: any) => {
        console.log("res", res);

        const data = {
          signature: res.signature, zoom_meeting_id: this.meetingId, password: this.password,
          username: this.userName, email: "", zak: res.zak
        }
        const dataString = JSON.stringify(data)

        // window.open(`${this.sdkUrl}`+'?data=' + dataString)
        // var newWindow = window.open(`${this.sdkUrl}` + '?data=' + dataString)
        var newWindow = window.open(`${this.sdkUrl}` + '?data=' + dataString, "_self")


        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Pop-up is blocked, show a message or perform any other action
          console.log('Pop-up is blocked. Please enable pop-ups for this site to use all features.');
          window.alert("Pop-up is blocked. Please enable pop-ups for this site to use all features")
        }

        this.popUp.closeAll()

      }, err => {
        console.log("error", err);
        this.popUp.closeAll()
        const snackBarRef = this.snackBar.open("Server not available or not reachable. Please try again later.", "X", { horizontalPosition: "center", verticalPosition: "top" });
        setTimeout(() => {
          snackBarRef.dismiss();
        }, 3000);
        // this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
      })
    }
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

  encrypt(data: any): string {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.secretKey
    ).toString();
    return encryptedData;
  }
  // Decrypt a string to a JSON object
  decrypt(encryptedData: any): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  }

  checkMaintanance() {
    const data = { system: "Angular" }
    this.newMeetingService.checkVersionUpdate(data).subscribe((res: any) => {
      this.maintananceData = res.MAINTENANCE

      // --------------function for getting the local system timezone
      const options = new Intl.DateTimeFormat().resolvedOptions();
      const timeZone = options.timeZone;
      // ------------------------------------------------
      const date = new Date()
      this.formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy HH:mm');
      const startDateString = this.maintananceData.start_date;
      const startDate = new Date(startDateString);
      const LocalstartDate = startDate.toLocaleDateString(undefined, { timeZone, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.startDate = this.datePipe.transform(LocalstartDate, 'dd/MM/yyyy HH:mm');
      // Using hasOwnProperty method
      if (this.maintananceData.hasOwnProperty('seconds_left')) {
        console.log('Key "key2" exists in the JSON object.');
        this.secondsLeft = true
      } else {
        this.secondsLeft = false
        console.log('Key "key2" does not exist in the JSON object.');
      }
      // checking the condition for showing the maintanance message...only show when the current date and and the start date same
      if (this.maintananceData.status == true && this.formattedDate >= this.startDate && this.secondsLeft == true) {
        console.log("both dates are same");
        const seconds = this.maintananceData.seconds_left;
        this.popUp.open(MaintananceComponent, { width: "600px", height: "150px", data: { seconds: seconds }, disableClose: true })
      } else {
        console.log("both dates are diffrent");
      }
    })
  }
  checkMaintananceDiv() {
    const data = { system: 'Angular' };
    this.auth.checkVersionUpdate(data).subscribe((res: any) => {
      this.maintananceData = res.MAINTENANCE;
      console.log(this.maintananceData);
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
      console.log(
        this.showDate,
        this.currentDate,
        'this.showDate',
        'this.currentDate'
      );

      if (
        this.maintananceData.status == true &&
        this.currentDate >= this.showDate) {
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


  sendMail() {
    this.popUp.open(LoadingSpinnerComponent)

    console.log(this.recoveryForm.value);
    this.auth.sendEmail(this.recoveryForm.value).subscribe((res: any) => {
      console.log(res);
      if (res.status == "Mail sent successfully") {
        this.popUp.closeAll()
        // this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message:"Mail Sent Successfully"} })
        const snackBarRef = this.snackBar.open("Mail Sent Successfully", "X", { horizontalPosition: "center", verticalPosition: "top" });
        setTimeout(() => {
          snackBarRef.dismiss();
        }, 3000);
        this.recoveryForm.reset()
      }
    }, err => {
      console.log("error", err);
      this.popUp.closeAll()
      // this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message:"User Does Not Exist" } })
      const snackBarRef = this.snackBar.open("User does not exist", "X", { horizontalPosition: "center", verticalPosition: "top" });
      setTimeout(() => {
        snackBarRef.dismiss();
      }, 3000);
      this.recoveryForm.reset()
    })
  }
  openInBrowser() {
    this.launchPage = false
    this.joinMeeting = true
  }
  testparams: any
  // openInApp() {
  //   const currentUrl = window.location.href;
  //   console.log(currentUrl, "currentUrl");
  //   const url = new URL(currentUrl);
  //   const params = new URLSearchParams(url.search);
  //   // Modify parameters as needed
  //   params.set('meetingNo', '81183440828');
  //   params.set('pwd', 'Sq2IL4j4W01LdJp6ftRnjL68hbkVL6.1');
  //   // Construct the new URL
  //   const newUrl = `mtnzoom.xlogix.ca:///?${params.toString()}`;
  //   console.log('New URL:', newUrl);
  //   window.open(newUrl, '_blank');

  // }
  // openInApp(): void {
  //   const currentUrl = window.location.href;
  //   console.log(currentUrl, "currentUrl");
  //   const url = new URL(currentUrl);
  //   const params = new URLSearchParams(url.search);
  //   const meetingNo = params.get('meetingNo');
  //   const pwd = params.get('pwd');
  //   if (!meetingNo || !pwd) {
  //     console.error('Meeting number or password is missing in the URL parameters.');
  //     return;
  //   }
  //   // const newUrl = `mtnzoom.xlogix.ca:///?type=join&meetingNo=${meetingNo}&pwd=${pwd}`;
  //   const newUrl = `meetings.mtn.com:///?type=join&meetingNo=${meetingNo}&pwd=${pwd}`;
  //   console.log('New URL:', newUrl);
  //   const iframe = document.createElement('iframe');
  //   iframe.style.display = 'none';
  //   document.body.appendChild(iframe);
  //   iframe.src = newUrl;
  //   const timeout = setTimeout(() => {
  //     this.openInBrowser();
  //   }, 1000);
  //   window.onblur = () => {
  //     clearTimeout(timeout);
  //     console.log('App installed, setting success conditions');
  //   };
  // }

  openInApp(): void {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const meetingNo = params.get('meetingNo');
    const pwd = params.get('pwd');
    if (!meetingNo || !pwd) {
      console.error('Meeting number or password is missing in the URL parameters.');
      return;
    }
    const newUrl = `meetings.mtn.com:///?type=join&meetingNo=${meetingNo}&pwd=${pwd}`;
    // const newUrl = `meetings.mtn.com:///?type=join&meetingNo=${meetingNo}&pwd=${pwd}`;
    console.log('New URL:', newUrl);
    const timeout = setTimeout(() => {
      this.openInBrowser();
    }, 1000);
    window.location.href = newUrl;
    window.onblur = () => {
      clearTimeout(timeout);
      console.log('App installed, setting success conditions');
    };
  }

  os: string = ''
  detectOs() {
    const userAgent = navigator.userAgent;
    if (userAgent.match(/Android/i)) {
      this.os = 'Android';
      console.log(this.os);

    } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
      this.os = 'iOS';
      console.log(this.os);

    } else if (userAgent.match(/Windows/i)) {
      this.os = 'Windows';
      console.log(this.os);

    } else if (userAgent.match(/Macintosh|Mac OS X/i)) {
      this.os = 'macOS';
      console.log(this.os);

    } else if (userAgent.match(/Linux/i)) {
      this.os = 'Linux';
      console.log(this.os);

    } else {
      this.os = 'Unknown';
      console.log(this.os);
    }
  }
  fallbackurl: any
  ExtractUrl() {
    const currentUrl = window.location.href;
    console.log(currentUrl, "currentUrl");
    const url = new URL(currentUrl);
    const baseRoute = url.pathname;
    console.log('Base Route:', baseRoute);
    this.fallbackurl = baseRoute
    console.log(this.fallbackurl);

  }
}

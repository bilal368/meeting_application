import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'src/services/login/login.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../shared/popup/popup.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-generate-password',
  templateUrl: './generate-password.component.html',
  styleUrls: ['./generate-password.component.css']
})
export class GeneratePasswordComponent {

  generatePasswordForm: FormGroup
  passwordToken: any = ''
  timeZoneArray: any = []
  password: any = ''
  confirmPassword: any = ''
  hideNew: boolean = true
  hideOld: boolean = true
  constructor(private fb: FormBuilder, private service: LoginService, private route: ActivatedRoute, private popUp: MatDialog,
    private router: Router, private ActivatedRoute: ActivatedRoute) {
    this.generatePasswordForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      timezone: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$?@])[a-zA-Z\d!#$?@]{8,}$/)
      ]],
      confirmPassword: [''],
      token: [''],
      email: ['']
    })
  }

  ngOnInit(): void {
    this.passwordToken = this.route.snapshot.paramMap.get('token')
    this.generatePasswordForm.patchValue({
      token: this.passwordToken
    })
    this.getData()


  }

  getTimeZone() {
    this.service.getTimeZones({ autheticationToken: this.passwordToken }).subscribe((res: any) => {
      console.log(res, "timezones");
      if (Array.isArray(res.timezone)) {
        this.timeZoneArray = res.timezone.sort((a: any, b: any) => a.timezoneName.localeCompare(b.timezoneName));
      } else {
        console.error('Invalid timezone data structure:', res.timezone);
      }
    }, err => {
      if (err.error.message == undefined) {
        this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: err.message } })
      } else {
        this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: err.error.message } })
      }
      console.log("error", err);
    })
  }

  getData() {
    this.service.getData({ authenticationToken: this.passwordToken }).subscribe((res: any) => {
      console.log(res);
      this.getTimeZone()
      this.generatePasswordForm.patchValue({
        firstName: res[0].firstName,
        lastName: res[0].lastName,
        timezone: res[0].timezone,
        email: res[0].userMail
      })

    }, err => {
      console.log("error", err);
      if (err.error.message == undefined) {
        this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: err.message } })
      } else {
        this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: err.error.message } })
      }
      // this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })

    })
  }

  submit() {

    this.password = this.generatePasswordForm.value.password
    this.confirmPassword = this.generatePasswordForm.value.confirmPassword
    if (this.password == this.confirmPassword) {
      this.popUp.open(LoadingSpinnerComponent)
      this.service.updateUserWithId(this.generatePasswordForm.value).subscribe((res: any) => {
        console.log(res);
        // this.toLogin = true
        if (res.message == "User updated") {
          this.router.navigateByUrl('')
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "600px", height: "300px", data: { message: "User Updated Successfully" } })
          localStorage.clear()
        }
        else {
          this.popUp.open(PopupComponent, { width: "600px", height: "300px", data: { message: res.error } })
        }

      }, err => {
        this.popUp.closeAll()
        console.log("error", err);

        if (err.error.message == undefined) {
          this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: err.message } })
        } else if (err.status == 504) {
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
        }
        else {
          this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: err.error.message } })
        }
      })
    } else {
      this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Password mismatch. Please enter the same password." } })
    }
  }



}

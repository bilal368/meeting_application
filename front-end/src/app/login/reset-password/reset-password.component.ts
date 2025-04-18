import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupComponent } from 'src/app/shared/popup/popup.component';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { LoginService } from 'src/services/login/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  ResetForm!: FormGroup
  data: any
  alert = false
  isLoading = false
  hideNew: boolean = true
  hideOld: boolean = true
  constructor(private fb: FormBuilder, private service: LoginService, private route: ActivatedRoute, private popUp: MatDialog, private router: Router, private Service: AuthguardService) {
    this.ResetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$?@])[a-zA-Z\d!#$?@]{8,}$/)
      ]],
      conformPassword: ['', Validators.required],
      token: ['']
    })
  }

  ngOnInit(): void {
    this.ResetForm.patchValue({
      token: this.route.snapshot.paramMap.get('token')
    })
    this.networkError()


  }


  save() {
    this.data = { password: this.ResetForm.value.password, token: this.ResetForm.value.token }
    console.log(this.data);
    if (this.ResetForm.value.password == this.ResetForm.value.conformPassword) {
      this.service.updatePassword(this.data).subscribe((res: any) => {
        this.isLoading = true
        if (res.message == "User updated successfully") {
          this.isLoading = false
          this.router.navigateByUrl('')
          this.popUp.open(PopupComponent, { width: "450px", height: "350px", data: { message: "Password Updated Successfully" } })
        }
        else if (res.status == false) {
          this.isLoading = false
          this.ResetForm.reset()
          this.popUp.open(PopupComponent, { width: "550px", height: "200px", data: { message: res.message } })

        }
      }, err => {
        console.log(err, "updatePassword");
        this.isLoading = false
        console.log(err.error.error);

        this.popUp.open(PopupComponent, { width: "450px", height: "350px", data: { message:err.error.error } })
        this.ResetForm.patchValue({
          password: '',
          conformPassword: ''
        })
      })
    } else {
      this.alert = false
      this.ResetForm.patchValue({
        password: '',
        conformPassword: ''
      })
      this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Password mismatch. Please enter the same password." } })
    }
  }
  test() {
    this.alert = false
  }
  // networkError() {
  //   this.Service.isOnline().subscribe((resp) => {
  //     if (resp != true) {
  //       this.popUp.open(PopupComponent, {
  //         width: "550px", height: "300px", data: { message: "Network is not available. Please check your internet connection." }
  //       })
  //     } else {
  //       console.log("else case worked");
  //     }
  //   })
  // }
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
  clearStorage() {
    localStorage.clear()
    this.router.navigateByUrl('')

  }

}

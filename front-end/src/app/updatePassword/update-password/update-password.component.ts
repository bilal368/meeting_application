import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopupComponent } from 'src/app/shared/popup/popup.component';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { LoginService } from 'src/services/login/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent {

  updatePasswordForm: FormGroup
  isLoading:boolean=false
  hide: boolean = true;
  hideNew:boolean=true
  hideOld:boolean=true
  ngOnInit(): void {
    const loginId = localStorage.getItem('loginId')
    this.updatePasswordForm.patchValue({
      loginId: loginId
    })
  }
  constructor(private fb: FormBuilder, private authservice: LoginService, private popUp: MatDialog, private service: AuthguardService) {
    this.updatePasswordForm = this.fb.group({
      loginId: [''],
      password: ['', Validators.required],
      newpassword: ['', [Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$?@])[a-zA-Z\d!#$?@]{8,}$/)
    ]],
      confirmPassword: ['', [Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$?@])[a-zA-Z\d!#$?@]{8,}$/)
    ]]
    })
  }
  save() {
    console.log(this.updatePasswordForm.value);
    
    if (this.updatePasswordForm.value.newpassword != this.updatePasswordForm.value.confirmPassword) {
      // Swal.fire("Password Missmatch", "Please Enter Same Password!", "error");
      this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Password mismatch. Please enter the same password." } })
      this.updatePasswordForm.patchValue({
        newpassword:'',
        confirmPassword:''
      })

    }
    else {
      this.isLoading=true
      console.log(this.isLoading,"isLoading");
      this.authservice.updatePasswordUserPassword(this.updatePasswordForm.value).subscribe((res: any) => {
        console.log(res);
        if (res.status == true) {
          this.service.updatePasswordLogout()
          this.popUp.open(PopupComponent, { width: "600px", height: "300px", data: { message: "Your password has been successfully updated. For security reasons, you will be automatically logged out. Please re-login using your new credentials to continue accessing the system." } })
          // this.dialogRef.close()
          this.isLoading=false
          this.updatePasswordForm.reset()
        }
        else {
          this.isLoading=false
          this.popUp.open(PopupComponent, { width: "400px", height: "250px", data: { message: res.error} })
          // this.dialogRef.close()
        }
      }, err => {
        if (err.status = 401) {
          this.isLoading=false
          console.log("error", err);
          this.popUp.closeAll()
          this.service.logout()
        }
        else {
          this.popUp.closeAll()
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
        }
      })

    }

  }
  

}

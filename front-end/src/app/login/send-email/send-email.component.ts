import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupComponent } from 'src/app/shared/popup/popup.component';
import { LoginService } from 'src/services/login/login.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css']
})

export class SendEmailComponent {
  recoveryForm!:FormGroup
  loading=false
  form=true
  constructor(private fb: FormBuilder,private auth: LoginService,private popUp:MatDialog,private router: Router){
    this.recoveryForm=this.fb.group({
      email:['',[Validators.required,Validators.email]]
    })
  }

  sendMail(){
    this.form=false
    this.loading=true
    this.auth.sendEmail(this.recoveryForm.value).subscribe((res:any)=>{
      this.form=true
      this.loading=false
      if(res.status=="mail send successfully"){
      this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message:"Mail Sent Successfully"} })
      this.recoveryForm.reset()
      }
    },err=>{
      console.log("error",err);
      
      this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message:"User Does Not Exist" } })
        this.recoveryForm.reset()
        this.form=true
        this.loading=false
    })
  }
  EnableLogin(){
    this.router.navigateByUrl('')
  }
}

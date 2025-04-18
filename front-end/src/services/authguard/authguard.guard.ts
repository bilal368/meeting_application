import { Injectable } from '@angular/core';
import {  Router } from '@angular/router';
import { AuthguardService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

  constructor(private authGuard : AuthguardService, private route : Router){}

  canActivate(): any
  {
    if(!this.authGuard.getToken()){
      this.route.navigateByUrl("")
    }
    return this.authGuard.getToken();

  }


}

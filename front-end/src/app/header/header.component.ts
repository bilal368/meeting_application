import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UpdatePasswordComponent } from '../updatePassword/update-password/update-password.component';
import { LoginService } from 'src/services/login/login.service';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';
import { LogoutPopupComponent } from '../home/logout-popup/logout-popup.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private router: Router, private popUp: MatDialog,private service:LoginService,private meetingListService:MeetinglistService) { }

  userName: any = ''
  userInitials:any

  ngOnInit(): void {
    this.userName = localStorage.getItem('displayName')
    this.setInitials()
    // this.userName = this.userName.replace('mtn.', '')
    console.log(this.userName);
  }

  logout() {
    this.popUp.open(LogoutPopupComponent, {
      width: '350px',
      height: 'auto',
    });

  }
  openUpdatePassword() {
    this.popUp.open(UpdatePasswordComponent, { width: "400px", height: "400px" })
  }
  setValue(name: any) {
    localStorage.setItem('path', name)
  }
 
  setProfileNotification(type: any) {
    this.service.setProfileRoute(type)
  }
  setRoute(route:any){
    this.meetingListService.setRoute(route)
  }
  setInitials(): void {
    const words = this.userName.split(' ');
    const firstInitial = words[0] ? words[0].charAt(0) : '';
    const lastInitial = words.length > 1 ? words[words.length - 1].charAt(0) : '';
    this.userInitials = (firstInitial + lastInitial).toUpperCase();
  }
}

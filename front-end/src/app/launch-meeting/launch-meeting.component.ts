import { Component, OnInit } from '@angular/core';
import { LaunchAppComponent } from './launch-app/launch-app.component';
import { MatDialog } from '@angular/material/dialog';
import { JoinMeetingService } from 'src/services/joinMeeting/join-meeting.service';

@Component({
  selector: 'app-launch-meeting',
  templateUrl: './launch-meeting.component.html',
  styleUrls: ['./launch-meeting.component.css']
})
export class LaunchMeetingComponent implements OnInit{
  constructor( private popUp: MatDialog,private service:JoinMeetingService){}
  ngOnInit(): void {
    this.detectOs()
    // this.openPOPup()
    this.getUrl()
    // this.check()
    
  }
  os:string = ''
  windows=false
  android=false
  ios=false
  mac=false
  appInstalled: boolean | undefined;

  detectOs() {
  const userAgent = navigator.userAgent;
  if (userAgent.match(/Android/i)) {
    this.os = 'Android';
    console.log(this.os);
    this.android=true

  } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
    this.os = 'iOS';
    console.log(this.os);
    this.ios=true

  } else if (userAgent.match(/Windows/i)) {
    this.os = 'Windows';
    console.log(this.os);
    this.windows=true

  } else if (userAgent.match(/Macintosh|Mac OS X/i)) {
    this.os = 'macOS';
    console.log(this.os);
    this.mac=true

  } else if (userAgent.match(/Linux/i)) {
    this.os = 'Linux';
    console.log(this.os);

  } else {
    this.os = 'Unknown';
    console.log(this.os);
  }
}



// openAppOrBrowser() {
//   const appScheme = "MTN_BUILD:"; // Replace with the custom URI scheme of the app
//   const appInstalled = this.isAppInstalled(appScheme);
//   if (appInstalled) {
//     window.location.href = appScheme;
//   } else {
//     window.open("https://mtnzoom.xlogix.ca/", "_blank");
//   }
// }

// isAppInstalled(scheme: string): boolean {
//   const iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   iframe.src = scheme;
//   document.body.appendChild(iframe);

//   setTimeout(() => {
//     document.body.removeChild(iframe);
//   }, 2000);

//   return true;
// }

async openZoomMeeting(): Promise<void> {
  const isZoomAppInstalled = await this.checkIfZoomAppInstalled();

  if (isZoomAppInstalled) {
    window.location.href = 'zoomus://';
  } else {
    window.location.href = 'https://zoom.us/';
  }
}

async checkIfZoomAppInstalled(): Promise<boolean> {
  try {
    const result = await fetch('zoomus://', { method: 'HEAD' });
    return result.ok;
  } catch (error) {
    return false;
  }
}

getUrl(){
  const currentUrl = window.location.href;
  console.log(currentUrl);
  
}

  
  openPOPup(){
    this.popUp.open(LaunchAppComponent, { width: "450px", height: "300px", })
  }


  }


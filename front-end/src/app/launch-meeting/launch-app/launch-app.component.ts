import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-launch-app',
  templateUrl: './launch-app.component.html',
  styleUrls: ['./launch-app.component.css']
})
export class LaunchAppComponent implements OnInit{
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

constructor(private http: HttpClient){}
  openMeetingLink(): void {
    const meetingLink = 'https://meetings.mtn.com/?type=join&meetingNo=81183440828&pwd=Sq2IL4j4W01LdJp6ftRnjL68hbkVL6.1';
    window.open(meetingLink, '_blank');
  }



  
}

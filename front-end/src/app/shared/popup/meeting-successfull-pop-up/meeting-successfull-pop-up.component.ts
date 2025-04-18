import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';

@Component({
  selector: 'app-meeting-successfull-pop-up',
  templateUrl: './meeting-successfull-pop-up.component.html',
  styleUrls: ['./meeting-successfull-pop-up.component.css']
})
export class MeetingSuccessfullPopUpComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public datas: any, private service: MeetinglistService, private snackBar: MatSnackBar, private datePipe: DatePipe, private popUp: MatDialog) { }
  message: any = ''
  clipboardData: any = {}
  password: any
  topic: any
  time: any
  timezone: any

  ngOnInit(): void {
    this.getFromPopUp()

  }

  copyMeetingDetails(): void {
    const formattedTime = this.datePipe.transform(this.time, 'dd-MM-yyyy HH:mm')
    console.log(formattedTime, "formattedTime");
    const meetngDetails = `${this.clipboardData.displayName} is inviting you to a scheduled meeting.
      Topic: ${this.topic} 
      Date and Time: ${formattedTime} (${this.timezone})

      Please find the meeting details below:

      Join Meetings⁺:
      (${this.clipboardData.zainJoinUrl})

      Join Zoom Meeting:
      (${this.clipboardData.joinUrl})

      Meeting ID: ${this.clipboardData.zoom_meeting_id}
      Passcode: ${this.password}`
    const success = this.service.copyToClipboard(meetngDetails);

    if (success) {
      this.showNotification('Meeting details copied to clipboard successfully');
      this.popUp.closeAll()

    } else {
      console.error('Error copying meeting details to clipboard');
    }
  }
  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // 3 seconds
    });
  }
  getFromPopUp() {
    this.message = this.datas.message
    this.clipboardData = this.datas.clipboardData
    console.log(this.clipboardData, "clipboardData");
    this.password = this.datas.password
    this.topic = this.datas.topic
    this.timezone = this.datas.timezone
    console.log(this.timezone);
    this.time = this.datas.time.replace('T', ' ').replace(/\.\d{3}[+-]\d{2}:\d{2}$/, ''); // Remove .xxx+/-XX:XX
    console.log(this.time, " this.time");
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-maintanance',
  templateUrl: './maintanance.component.html',
  styleUrls: ['./maintanance.component.css']
})
export class MaintananceComponent implements OnInit {
  seconds: any
  hours: any
  minutes: any
  countdownInterval: any;
  time: any
  label: any 
  totalTimeInSeconds: number = 0
  interval: any;

  constructor(@Inject(MAT_DIALOG_DATA) public datas: any, private dialogRef: MatDialogRef<MaintananceComponent>) { }

  ngOnInit(): void {
    this.totalTimeInSeconds = this.datas.seconds
    // this.totalTimeInSeconds=120
    setInterval(() => {
      this.updateLabel();
    }, 1000);
    this.calculateTime();
    this.startCountdown();
   
  }


  // calculateTime() {
  //   this.minutes = Math.floor(this.totalTimeInSeconds / 60);
  //   this.seconds = this.totalTimeInSeconds % 60;
  // }

  // startCountdown() {
  //   this.interval = setInterval(() => {
  //     if (this.totalTimeInSeconds > 0) {
  //       this.totalTimeInSeconds--;
  //       this.calculateTime();
  //     } else {
  //       clearInterval(this.interval);
  //       this.dialogRef.close();
  //     }
  //   }, 1000); 
  // }

  calculateTime() {
    if (this.totalTimeInSeconds >= 3600) {
      this.hours = Math.floor(this.totalTimeInSeconds / 3600);
      this.minutes = Math.floor((this.totalTimeInSeconds % 3600) / 60);
      this.seconds = this.totalTimeInSeconds % 60;
      this.label = "Hours";
    } else {
      this.hours = 0;
      this.minutes = Math.floor(this.totalTimeInSeconds / 60);
      this.seconds = this.totalTimeInSeconds % 60;
      
      // Check if there are only minutes and update the label accordingly
      if (this.minutes > 0) {
        this.label = "Minutes";
      } else {
        this.label = "Seconds";
      }
    }
  }

  startCountdown() {
    this.interval = setInterval(() => {
      if (this.totalTimeInSeconds > 0) {
        this.totalTimeInSeconds--;
        this.calculateTime();
      } else {
        clearInterval(this.interval);
        this.dialogRef.close();
      }
    }, 1000); 
  }


  updateLabel() {
    if (this.hours >= 1) {
      this.label = "Hours";
    } else if (this.minutes >= 1) {
      this.label = "Minutes";
    } else {
      this.label = "Seconds";
    }
  }


}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-password-retry',
  templateUrl: './password-retry.component.html',
  styleUrls: ['./password-retry.component.css']
})
export class PasswordRetryComponent implements OnInit {
  seconds: any
  hours: any
  minutes: any
  countdownInterval: any;
  time: any
  label: any = "Minutes"
  totalTimeInSeconds: number = 0
  interval: any;
  constructor(@Inject(MAT_DIALOG_DATA) public datas: any, private dialogRef: MatDialogRef<PasswordRetryComponent>) { }
  ngOnInit(): void {
    this.totalTimeInSeconds = this.datas.seconds
    this.calculateTime();
    this.startCountdown();
    setInterval(() => {
      this.updateLabel();
    }, 1000);
  }

  calculateTime() {
    this.hours = Math.floor(this.totalTimeInSeconds / 3600);
    this.minutes = Math.floor((this.totalTimeInSeconds % 3600) / 60);
    this.seconds = this.totalTimeInSeconds % 60;
  }

  startCountdown() {
    this.interval = setInterval(() => {
      if (this.totalTimeInSeconds > 0) {
        this.totalTimeInSeconds--;
        this.calculateTime();
      } else {
        clearInterval(this.interval);
        this.dialogRef.close();
        // You can perform any action when the countdown reaches zero
      }
    }, 1000); // Update every second
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

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';
import { PopupComponent } from 'mtn-sdk/src/app/popup/popup.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { DeleteSummaryComponent } from './delete-summary/delete-summary.component';
@Component({
  selector: 'app-view-summary-details',
  templateUrl: './view-summary-details.component.html',
  styleUrls: ['./view-summary-details.component.css']
})
export class ViewSummaryDetailsComponent implements OnInit {
  formattedData: any
  summaryData: any
  summaryTitle: any
  summaryDetails: any
  summaryOverView: any
  uuid: any
  next_steps: any = null
  isEditMode: boolean = false;
  enableMail: any = false
  emailIds: any
  loading: any = false
  addOnBlur = true;
  selectable = true;
  removable = true;
  noMessage: any = true
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emailCtrl = new FormControl('');
  emails: string[] = [];
  errorMessage: string = '';
  constructor(@Inject(MAT_DIALOG_DATA) public datas: any, private meetinglistService: MeetinglistService, private popUp: MatDialog, private snackbar: MatSnackBar,) { }

  ngOnInit(): void {
    this.getFromDatas()
  }


  enableEdit() {
    this.isEditMode = !this.isEditMode;
  }
  getFromDatas() {
    this.summaryData = this.datas.data
    this.summaryDetails = JSON.parse(this.summaryData.summary_Details);
    this.summaryTitle = this.summaryData.summary_title
    this.summaryOverView = this.summaryData.summary_overview
    this.uuid = this.summaryData.uuid
  }

  shareSummary() {
    this.enableMail = true
  }
  cancel() {
    this.enableMail = false
    this.emailIds = ''
  }
  sendEmail() {
    console.log(this.emails, "emails");

    this.loading = true
    const data = { uuid: this.uuid, emails: this.emails }
    this.meetinglistService.sendSummary(data).subscribe((res: any) => {
      console.log(res, "sendEmail");
      this.loading = false
      this.enableMail = false
      this.emails = []
      if (res.status == true) {
        this.snackbar.open("Email sent sucessfully", 'Dismiss', { duration: 5000 });
      } else {
        this.emails = []
      }
    })

  }


  saveEditedData() {
    const data = { summary_overview: this.summaryOverView, summary_Details: this.summaryDetails, next_steps: this.next_steps, uuid: this.uuid }
    this.meetinglistService.updateSummary(data).subscribe((res: any) => {
      console.log(res, "saveEditedData");
      this.snackbar.open(res.message, 'Dismiss', { duration: 5000 });
      this.meetinglistService.setUpdateNotification(true)
      this.isEditMode = !this.isEditMode;
    },
    (err) => {
      if (err.status == 504) {
        this.popUp.closeAll()
        this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
      }
      else {
        this.popUp.closeAll()
        this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
      }
    }
  );
  }
  DeleteSummary() {
    this.popUp.open(DeleteSummaryComponent, { width: "400px", height: "250px", data: { uuid: this.uuid }, disableClose: true })

    // const data = { uuid: this.uuid }
    // this.meetinglistService.deleteSummary(data).subscribe((res: any) => {
    //   console.log(res, "DeleteSummary");
    //   this.snackbar.open(res.message, 'Dismiss', { duration: 5000 });
    //   this.popUp.closeAll()
    //   this.meetinglistService.setUpdateNotification(true)
    // })

  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
  
    // Check if value is not empty or null
    if (value) {
      if (this.isValidEmail(value)) {
        if (this.emails.includes(value)) {
          this.showErrorMessage('Email address already exists');
        } else {
          this.emails.push(value);
          this.errorMessage = '';
        }
      } else {
        this.showErrorMessage('Invalid email address');
      }
    }
  
    event.chipInput!.clear();
    this.emailCtrl.setValue(null);
  }
  
  remove(email: string): void {
    const index = this.emails.indexOf(email)
      ;

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  showErrorMessage(message: string) {
    const config: MatSnackBarConfig = {
      duration: 3000,
      verticalPosition: 'top' // Specify the vertical position as 'top'
    };
    this.snackbar.open(message, 'Close', config);
  }
}

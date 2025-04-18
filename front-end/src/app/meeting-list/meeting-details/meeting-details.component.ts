import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';
import { DeleteMeetingConfirmationComponent } from './delete-meeting-confirmation/delete-meeting-confirmation.component';
import { DatePipe } from '@angular/common';
import { PopupComponent } from 'src/app/shared/popup/popup.component';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.css']
})
export class MeetingDetailsComponent implements OnInit {
  meetingDetailsForm!: FormGroup
  id: any
  data: any
  timeZones: any

  meetingTopic: any
  MeetingId: any
  meetingPassword: any
  displayName: any
  meetingTime: any
  meetingTimeZone: any
  mtnZoomMeetingUrl: any
  zoomMeetingUrl: any
  startTime: any
  meetingDuration: any
  disableTimezone: boolean = true
  isLoading: boolean = false
  meetingDetails: any
  formattedTime: any
  date: any
  userTimezone: any
  constructor(private fb: FormBuilder, private router: Router, private datePipe: DatePipe,
    private popUp: MatDialog, @Inject(MAT_DIALOG_DATA) public datas: any, private auth: MeetinglistService, private service: AuthguardService, private snackBar: MatSnackBar) {
    this.meetingDetailsForm = this.fb.group({
      Timezone: [''],
      Time: [''],
      Topic: [''],
      MeetingId: [''],
      Duration: [''],
      Password: [''],
      duration: ['']
    })
  }
  ngOnInit(): void {
    this.id = this.datas.id
    this.date = this.datas.date
    this.displayName = localStorage.getItem('displayName')
    this.userTimezone = localStorage.getItem('timeZone')
    this.getMeetingDetailsByMeetingId()
    this.getTimezones()
    // this.networkError()

  }

  save() {
  }
  EditOccurence() {
    this.popUp.open(DeleteMeetingConfirmationComponent, { width: "550px", height: "250px", data: { meetingId: this.id, occurenceId: this.occurenceId, type: 2, heading: "Edit Meeting" } })
  }
  route() {
    this.router.navigateByUrl(`/home/edit-meeting-schedule/ ${this.id} `)
    this.popUp.closeAll()
  }
  occurenceId: any
  updatedOccurrences: any
  timeinScheduledTimezone: any
  getMeetingDetailsByMeetingId() {
    this.data = { meetingId: this.id }
    this.isLoading = true
    this.auth.getMeetingDetailsByMeetingId(this.data).subscribe((res: any) => {
      console.log(res, "getMeetingDetailsByMeetingId");
      this.isLoading = false
      this.meetingTopic = res.meeting.topic
      this.MeetingId = res.meeting.id
      this.meetingPassword = res.meeting.password
      this.meetingTimeZone = res.meeting.timezone
      this.zoomMeetingUrl = res.meeting.join_url
      this.mtnZoomMeetingUrl = res.meeting.zainJoinUrl
      if (res.meeting.occurrences) {
        console.log(res.meeting.occurrences, "res.meeting.occurrences");
        console.log(this.meetingTimeZone, "meetingTimeZone");
        console.log(this.userTimezone, "userTimezone");
        if (this.meetingTimeZone == this.userTimezone) {
          this.timeinScheduledTimezone = this.date.replace('T', ' ').replace('Z', '')
          this.startTime=this.timeinScheduledTimezone
          console.log(this.startTime,"this.startTime");
        } else {
          this.timeinScheduledTimezone = this.convertDateToTimezone(this.date, this.userTimezone, this.meetingTimeZone);
          this.startTime=this.timeinScheduledTimezone
          console.log(this.startTime,"this.startTime");
        }
        console.log(this.timeinScheduledTimezone, "timeinScheduledTimezone");
        this.updatedOccurrences = res.meeting.occurrences.map((occurrence: { start_time: string; }) => {
          return {
            ...occurrence,
            start_time: occurrence.start_time.replace('T', ' ').replace('Z', '')
          };
        });
        console.log(this.updatedOccurrences, "updatedOccurrences");
        console.log(this.date, "this.occurrence_id");
        const occurrenceId = this.updatedOccurrences.find((item: any) => item.start_time === this.timeinScheduledTimezone)?.occurrence_id;
        console.log(occurrenceId, "occurrenceId");
        this.startTime = res.meeting.occurrences[0].start_time
        const durationItem = res.meeting.occurrences.find((item: any) => item.occurrence_id === occurrenceId);
        if (durationItem && durationItem.duration) {
          this.meetingDuration = durationItem.duration;

        } else {
          console.log("No valid duration found");
        }
        // console.log(res.meeting.occurrences[0].occurrence_id, "occurence Id")
        this.occurenceId = occurrenceId
      } else {
        this.startTime = res.meeting.start_time
        this.meetingDuration = res.meeting.duration
      }
      const formattedDuration = formatDuration(this.meetingDuration);

      function formatDuration(minutes: any) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        const hoursDisplay = hours > 0 ? `${hours} hr` : '';
        const minutesDisplay = remainingMinutes > 0 ? `${remainingMinutes} min` : '';

        return hoursDisplay + (hoursDisplay && minutesDisplay ? ' ' : '') + minutesDisplay;
      }

      // this.startTime = this.datePipe.transform(this.startTime, 'dd-MM-yyyy hh:mm a');

      this.meetingDetailsForm.patchValue({
        Timezone: res.meeting.timezone,
        Time: res.meeting.start_time,
        Topic: res.meeting.topic,
        MeetingId: res.meeting.id,
        Password: res.meeting.password,
        duration: formattedDuration
      })

    }, err => {
      if (err.status == 504) {
        this.popUp.closeAll()
        this.popUp.open(PopupComponent, { width: "500px", height: "250px", data: { message: "Server not available or not reachable. Please try again later." } })
      } else if (err.status == 401) {
        this.service.logout()
      }
      else {
        this.popUp.closeAll()
        this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: err.error.message } })
      }
    })

  }

  openOutlookWithContent() {
    // const originalTimeWithoutTZ = this.startTime.replace('T', ' ').replace('Z', '')
    // const originalDate = new Date(originalTimeWithoutTZ);
    // const day = originalDate.getDate();
    // const month = (originalDate.getMonth() + 1).toString().padStart(2, '0');
    // const year = originalDate.getFullYear();
    // const hours = originalDate.getHours();
    // const minutes = originalDate.getMinutes();
    // const paddedHours = hours.toString().padStart(2, '0');
    // const paddedMinutes = minutes.toString().padStart(2, '0');
    // const formattedDate = `${day}-${month}-${year} ${paddedHours}:${paddedMinutes} `;
    const originalTimeWithoutTZ = this.startTime.replace('T', ' ').replace('Z', '')
    const formattedDate=this.datePipe.transform(originalTimeWithoutTZ, 'dd-MM-yyyy HH:mm')
    const recipientEmail = '';
    const emailSubject = 'Meetings+ Invitation';
    const emailContent = `
     ${this.displayName} is inviting you to a scheduled meeting.

      Topic: ${this.meetingTopic}
      Date and Time: ${formattedDate} (${this.meetingTimeZone})

      Please find the meeting details below:

      Join Meetings⁺:
     (${this.mtnZoomMeetingUrl})

      Join Zoom Meeting:
      (${this.zoomMeetingUrl})

      Meeting ID: ${this.MeetingId}
      Passcode: ${this.meetingPassword}`


    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailContent)}`;

    window.location.href = mailtoUrl;
  }


  openDeleteConfirmation() {
    this.popUp.open(DeleteMeetingConfirmationComponent, { width: "550px", height: "250px", data: { meetingId: this.id, occurenceId: this.occurenceId, type: 1, heading: "Delete Meeting" } })
  }
  closePopup() {
    this.popUp.closeAll()
  }
  // function to fetch all timezones
  getTimezones() {
    this.auth.getTimeZones({ data: "data" }).subscribe((res: any) => {
      this.timeZones = res.timezone
    })
  }
  popupIsOpen: boolean = false;

  networkError() {
    // Check if the popup is already open
    if (this.popupIsOpen) {
      return; // If open, do nothing
    }

    this.service.isOnline().subscribe((resp) => {
      console.log(resp, "response");
      if (resp != true) {
        // Set the flag to true indicating the popup is open
        this.popupIsOpen = true;

        this.popUp.open(PopupComponent, {
          width: "550px",
          height: "300px",
          data: { message: "Network is not available. Please check your internet connection." }
        }).afterClosed().subscribe(() => {
          // Reset the flag when the popup is closed
          this.popupIsOpen = false;
        });
      } else {
        console.log("else case worked");
      }
    });
  }


  copyMeetingDetails(): void {
    const originalTimeWithoutTZ = this.startTime.replace('T', ' ').replace('Z', '')
    const updatedFormat=this.datePipe.transform(originalTimeWithoutTZ, 'dd-MM-yyyy HH:mm')
    this.meetingDetails = `${this.displayName} is inviting you to a scheduled meeting.
    Topic: ${this.meetingTopic}
    Date and Time: ${updatedFormat} (${this.meetingTimeZone})
    Please find the meeting details below:
    Join Meetings⁺:
    (${this.mtnZoomMeetingUrl})
    Join Zoom Meeting:
    (${this.zoomMeetingUrl})
    Meeting ID: ${this.MeetingId}
    Passcode: ${this.meetingPassword}`;
    const success = this.auth.copyToClipboard(this.meetingDetails);

    if (success) {
      this.showNotification('Meeting details copied to clipboard successfully');
    } else {
      console.error('Error copying meeting details to clipboard');
    }
  }
  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // 3 seconds
    });
  }

  convertDateToTimezone(date: string, sourceTimezone: string, targetTimezone: string): string {
    const replacedDate = date.replace('T', ' ').replace('Z', '');
    const dateInSourceTimezone = moment.tz(replacedDate, sourceTimezone);
    const dateInTargetTimezone = dateInSourceTimezone.clone().tz(targetTimezone);
    return dateInTargetTimezone.format('YYYY-MM-DD HH:mm:ss');
  }
}



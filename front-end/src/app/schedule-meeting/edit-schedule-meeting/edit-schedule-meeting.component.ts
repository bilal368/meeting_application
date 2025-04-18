import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupComponent } from 'src/app/shared/popup/popup.component';
import { ScheduleMeetingService } from 'src/services/schedule-meeting/schedule-meeting.service';
import { DatePipe } from '@angular/common';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { addMinutes, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-edit-schedule-meeting',
  templateUrl: './edit-schedule-meeting.component.html',
  styleUrls: ['./edit-schedule-meeting.component.css']
})
export class EditScheduleMeetingComponent {


  editScheduleForm!: FormGroup
  Monthly = false
  Weekly = false
  Daily = false
  EndDate = false
  reccurance = false
  weeklyOccurson = false
  userName: any
  Durationhours: any
  Durationminutes: any
  timezone: any
  weeklyDays: any

  duration: any

  reccuring = false
  EnddateNotformated: any
  formatedEndDate: any
  payload: any = {}
  formattedDate: any
  data: any = []

  // default day weekly
  daycheck: any
  array: any


  date: any
  test: any

  formattedTime: any
  timeZones: any = ''
  meetingId: any = ''
  // enddate
  targetDate: any
  selectedWeeks: any
  calculatedDate: any
  selectedMonths: any
  targetDateMonthly: any
  targetDateDaily: any
  selectedDays: any
  selectedReccuring: any

  dayValue: any
  weekvalue: any

  minutes: any = [
    { "value": 0, "name": "0 minutes" },
    { "value": 15, "name": "15 minutes" },
    { "value": 30, "name": "30 minutes" },
    { "value": 45, "name": "45 minutes" }
  ]

  Hours: any = [
    { "value": 0, "name": "0 hour" },
    { "value": 60, "name": "1 hour" },
    { "value": 120, "name": "2 hours" },
    { "value": 180, "name": "3 hours" },
    { "value": 240, "name": "4 hours" },
    { "value": 300, "name": "5 hours" },
    { "value": 360, "name": "6 hours" },
    { "value": 420, "name": "7 hours" },
    { "value": 480, "name": "8 hours" },
    { "value": 540, "name": "9 hours" },
    { "value": 600, "name": "10 hours" }
  ]

  Reccurances: any = [
    { "name": "Daily", "value": 1 },
    { "name": "Weekly", "value": 2 },
    { "name": "Monthly", "value": 3 },
  ]

  monthly_week: any = [
    { "name": "First", "value": 1 },
    { "name": "Second", "value": 2 },
    { "name": "Third", "value": 3 },
    { "name": "Fourth", "value": 4 },
    { "name": "Last", "value": -1 }
  ]

  repeatInterval: any = [
    { "name": "1", "value": 1 },
    { "name": "2", "value": 2 },
    { "name": "3", "value": 3 },
    { "name": "4", "value": 4 },
    { "name": "5", "value": 5 },
    { "name": "6", "value": 6 },
    { "name": "7", "value": 7 },
    { "name": "8", "value": 8 },
    { "name": "9", "value": 9 },
    { "name": "10", "value": 10 },
    { "name": "11", "value": 11 },
    { "name": "12", "value": 12 },
    { "name": "13", "value": 13 },
    { "name": "14", "value": 14 },
    { "name": "15", "value": 15 }
  ]
  repeatIntervalmonthly: any = [
    { "name": "1", "value": 1 },
    { "name": "2", "value": 2 },
    { "name": "3", "value": 3 }
  ]
  repeatIntervalWeekly: any = [
    { "name": "1", "value": 1 },
    { "name": "2", "value": 2 },
    { "name": "3", "value": 3 },
    { "name": "4", "value": 4 },
    { "name": "5", "value": 5 },
    { "name": "6", "value": 6 },
    { "name": "7", "value": 7 },
    { "name": "8", "value": 8 },
    { "name": "9", "value": 9 },
    { "name": "10", "value": 10 },
    { "name": "11", "value": 11 },
    { "name": "12", "value": 12 },

  ]
  monthlyOccurance: any = [
    { "value": 1 },
    { "value": 2 },
    { "value": 3 },
    { "value": 4 },
    { "value": 5 },
    { "value": 6 },
    { "value": 7 },
    { "value": 8 },
    { "value": 9 },
    { "value": 10 },
    { "value": 11 },
    { "value": 12 },
    { "value": 13 },
    { "value": 14 },
    { "value": 15 },
    { "value": 16 },
    { "value": 17 },
    { "value": 18 },
    { "value": 19 },
    { "value": 20 },
    { "value": 21 },
    { "value": 22 },
    { "value": 23 },
    { "value": 24 },
    { "value": 25 },
    { "value": 26 },
    { "value": 27 },
    { "value": 28 },
    { "value": 29 },
    { "value": 30 }]
  monthly_week_day: any = [
    { "name": "Sunday", "value": 1 },
    { "name": "Monday", "value": 2 },
    { "name": "Tuesday", "value": 3 },
    { "name": "Wednesday", "value": 4 },
    { "name": "Thursday", "value": 5 },
    { "name": "Friday", "value": 6 },
    { "name": "Saturday", "value": 7 }
  ];
  Days: any = [
    { "name": "Sunday", "value": 1 },
    { "name": "Monday", "value": 2 },
    { "name": "Tuesday", "value": 3 },
    { "name": "wed", "value": 4 },
    { "name": "Thursday", "value": 5 },
    { "name": "Friday", "value": 6 },
    { "name": "Saturday", "value": 7 }
  ];


  constructor(private router: Router, private fb: FormBuilder, private ActivatedRoute: ActivatedRoute, private auth: ScheduleMeetingService, private popUp: MatDialog, private datePipe: DatePipe, private service: AuthguardService, private snackBar: MatSnackBar) {
    this.editScheduleForm = this.fb.group({
      meetingTitle: ['', Validators.required],
      timeZone: [''],
      weekly: new FormControl(''),
      startDate: [''],
      startTime: [''],
      hour: [''],
      minutes: [''],
      reccuranceMeeting: false,
      reccuranceType: [''],
      DailyReccurance: [''],
      repeatInterval: [],
      repeatIntervalWeekly: [''],
      repeatIntervalMonthly: [''],
      sun: [''],
      mon: [''],
      tue: [''],
      wed: [''],
      thu: [''],
      fri: [''],
      sat: [''],
      day: [''],
      other: [''],
      monthlyOccurance: [''],
      monthly_week: [''],
      monthly_week_day: [''],
      endDate: [''],
      repeat: [''],
      requireMeetingPassword: false,
      password: [],
      enableWaitingRoom: false,
      athunticatedUser: false,
      HostVedio: false,
      participantVdio: false,
      audioOption: false,
      joinBeforeHost: false,
      auto_recording: ['']
    })
  }

  ngOnInit(): void {
    this.getEditType()
    this.defaultEndTime()
    this.startTimeValidation()
    this.meetingId = this.ActivatedRoute.snapshot.paramMap.get('meetingId')
    this.meetingId = parseInt(this.meetingId)
    console.log("meetin", this.meetingId);
    // this.userName = localStorage.getItem('userName')
    this.userName = localStorage.getItem('email')
    this.getMeetingDetailsByMeetingId()
    this.getTimezones()

  }

  route() {
    localStorage.removeItem('editType');
    localStorage.removeItem('occurenceId');
    this.router.navigateByUrl('/home/meeting-list')
  }

  save() {
    console.log(this.editScheduleForm.value, "scheduleee");
    console.log(this.editScheduleForm.value.reccuranceType)
    this.duration = this.editScheduleForm.value.hour + this.editScheduleForm.value.minutes
    console.log(this.duration, "duration");
    const startDateValue = this.editScheduleForm.value.startDate;
    console.log(startDateValue);
    const startDate = new Date(startDateValue);
    // this.formattedDate = this.datePipe.transform(startDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ');
    const timeZone = this.editScheduleForm.value.timeZone;         
    const localMoment = moment.tz(startDateValue, 'YYYY-MM-DD HH:mm', timeZone);
    const convertedTime = localMoment.clone().tz(timeZone);
    this.formattedDate = convertedTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    console.log(this.formattedDate, "formated");
    // this.formatedEndDate=
    if (this.editScheduleForm.value.reccuranceMeeting == false) {
      console.log("Norml");
      this.payload = {
        type: "2",
        duration: this.duration,
        start_time: this.formattedDate,
        timezone: this.editScheduleForm.value.timeZone,
        password: this.editScheduleForm.value.password,
        topic: this.editScheduleForm.value.meetingTitle,
        settings: {
          host_video: this.editScheduleForm.value.HostVedio,
          participant_video: this.editScheduleForm.value.participantVdio,
          join_before_host: this.editScheduleForm.value.joinBeforeHost,
          auto_recording: this.editScheduleForm.value.auto_recording,
          waiting_room: true,
          use_pmi: false

        }
      }
      console.log(this.payload, "normal");
      this.data = { "meetingId": this.meetingId, "payload": this.payload }
      this.auth.updateMeeting(this.data).subscribe((res: any) => {
        console.log(res);
        if (res.status == true) {
          localStorage.removeItem('editType');
          localStorage.removeItem('occurenceId');
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Meeting Updated Successfully" } })
        }
        else {
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Update Meeting" } })
        }
        localStorage.removeItem('editType');
        localStorage.removeItem('occurenceId');
        this.editScheduleForm.reset()
        this.router.navigateByUrl('/home/meeting-list')
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
    else {
      if (this.editScheduleForm.value.reccuranceType == 1) {
        console.log("dailyyyyy");
        console.log(this.editScheduleForm.value.reccuranceMeeting);
        const reopeatinterval = this.editScheduleForm.value.endDate
        this.formatedEndDate = reopeatinterval + "T23:59:00Z"
        console.log(this.formatedEndDate, "formated");
        // payload for reccuring meeting
        console.log("daily");
        this.payload = {
          type: "8",
          duration: this.duration,
          start_time: this.formattedDate,
          timezone: this.editScheduleForm.value.timeZone,
          password: this.editScheduleForm.value.password,
          topic: this.editScheduleForm.value.meetingTitle,
          settings: {
            host_video: this.editScheduleForm.value.HostVedio,
            participant_video: this.editScheduleForm.value.participantVdio,
            join_before_host: this.editScheduleForm.value.joinBeforeHost,
            auto_recording: this.editScheduleForm.value.auto_recording,
            waiting_room: true,
            use_pmi: false
          },
          recurrence: {
            end_date_time: this.formatedEndDate,
            repeat_interval: this.editScheduleForm.value.repeatInterval,
            type: "1",
          },
        }
        console.log(this.payload, "daily");
        this.data = { "meetingId": this.meetingId, "payload": this.payload }
        this.auth.updateMeeting(this.data).subscribe((res: any) => {
          console.log(res);
          if (res.status == true) {
            localStorage.removeItem('editType');
            localStorage.removeItem('occurenceId');
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Meeting Updated Successfully" } })
          }
          else {
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Create Meeting" } })
          }
          this.editScheduleForm.reset()
          this.router.navigateByUrl('/home/meeting-list')
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
      // hardcoded weekly reccurance
      else if (this.editScheduleForm.value.reccuranceType == 2) {
        console.log(this.editScheduleForm.value.repeatIntervalWeekly);
        const array: any = this.editScheduleForm.value.weekly;
        this.weeklyDays = array.join(', ');
        console.log("weekly")
        const reopeatinterval = this.editScheduleForm.value.endDate
        this.formatedEndDate = reopeatinterval + "T23:59:00Z"
        console.log(this.formatedEndDate, "formated");
        this.payload = {
          type: "8",
          duration: this.duration,
          start_time: this.formattedDate,
          timezone: this.editScheduleForm.value.timeZone,
          password: this.editScheduleForm.value.password,
          topic: this.editScheduleForm.value.meetingTitle,
          settings: {
            host_video: this.editScheduleForm.value.HostVedio,
            participant_video: this.editScheduleForm.value.participantVdio,
            join_before_host: this.editScheduleForm.value.joinBeforeHost,
            auto_recording: this.editScheduleForm.value.auto_recording,
            waiting_room: true,
            use_pmi: false
          },
          recurrence: {
            end_date_time: this.formatedEndDate,
            repeat_interval: this.editScheduleForm.value.repeatIntervalWeekly,
            type: "2",
            weekly_days: (this.weeklyDays)
          },
        }
        console.log(this.payload, "weekly");
        this.data = { "meetingId": this.meetingId, "payload": this.payload }
        this.auth.updateMeeting(this.data).subscribe((res: any) => {
          console.log(res);
          if (res.status == true) {
            localStorage.removeItem('editType');
            localStorage.removeItem('occurenceId');
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Meeting Updated Successfully" } })
          }
          else {
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Update Meeting" } })
          }
          this.editScheduleForm.reset()
          localStorage.removeItem('occurenceId');
          this.router.navigateByUrl('/home/meeting-list')
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
      else if (this.editScheduleForm.value.reccuranceType == 3) {
        if (this.editScheduleForm.value.monthly_week == undefined || this.editScheduleForm.value.day == "day") {
          console.log("day 143555");
          const reopeatinterval = this.editScheduleForm.value.endDate
          this.formatedEndDate = reopeatinterval + "T23:59:00Z"
          this.payload = {
            type: "8",
            duration: this.duration,
            start_time: this.formattedDate,
            timezone: this.editScheduleForm.value.timeZone,
            password: this.editScheduleForm.value.password,
            topic: this.editScheduleForm.value.meetingTitle,
            settings: {
              host_video: this.editScheduleForm.value.HostVedio,
              participant_video: this.editScheduleForm.value.participantVdio,
              join_before_host: this.editScheduleForm.value.joinBeforeHost,
              auto_recording: this.editScheduleForm.value.auto_recording,
              waiting_room: true,
              use_pmi: false
            },
            recurrence: {
              end_date_time: this.formatedEndDate,
              monthly_day: this.editScheduleForm.value.monthlyOccurance,
              repeat_interval: this.editScheduleForm.value.repeatIntervalMonthly,
              type: '3',
            },
          }
          console.log(this.payload, "dayyy");
          this.data = { "meetingId": this.meetingId, "payload": this.payload }
          this.auth.updateMeeting(this.data).subscribe((res: any) => {
            console.log(res);
            if (res.status == true) {
              localStorage.removeItem('editType');
              localStorage.removeItem('occurenceId');
              this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Meeting Updated Successfully" } })
            }
            else {
              this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Update Meeting" } })
            }
            this.editScheduleForm.reset()
            this.router.navigateByUrl('/home/meeting-list')
          }, err => {
            console.log("error", err);
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

        else if (this.editScheduleForm.value.monthlyOccurance == undefined || this.editScheduleForm.value.day != "day") {
          console.log("weekly 333333333333333333333333333333333333");
          const reopeatinterval = this.editScheduleForm.value.endDate
          this.formatedEndDate = reopeatinterval + "T23:59:00Z"
          this.payload = {
            type: "8",
            duration: this.duration,
            start_time: this.formattedDate,
            timezone: this.editScheduleForm.value.timeZone,
            password: this.editScheduleForm.value.password,
            topic: this.editScheduleForm.value.meetingTitle,
            settings: {
              host_video: this.editScheduleForm.value.HostVedio,
              participant_video: this.editScheduleForm.value.participantVdio,
              join_before_host: this.editScheduleForm.value.joinBeforeHost,
              auto_recording: this.editScheduleForm.value.auto_recording,
              waiting_room: true,
              use_pmi: false
            },
            recurrence: {
              end_date_time: this.formatedEndDate,
              monthly_week: this.editScheduleForm.value.monthly_week,
              monthly_week_day: this.editScheduleForm.value.monthly_week_day,
              repeat_interval: this.editScheduleForm.value.repeatIntervalMonthly,
              type: '3',
            },
          }
          console.log(this.payload, "other");
          this.data = { "meetingId": this.meetingId, "payload": this.payload }
          this.auth.updateMeeting(this.data).subscribe((res: any) => {
            console.log(res);
            if (res.status == true) {
              localStorage.removeItem('editType');
              localStorage.removeItem('occurenceId');
              this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Meeting Updated Successfully" } })
            }
            else {
              this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Create Meeting" } })
            }
            this.editScheduleForm.reset()
            this.router.navigateByUrl('/home/meeting-list')
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

      }
      // pay load for normal meeting scheduling
      else {
        console.log("Norml");
        this.payload = {
          type: "2",
          duration: this.duration,
          start_time: this.formattedDate,
          timezone: this.editScheduleForm.value.timeZone,
          password: this.editScheduleForm.value.password,
          topic: this.editScheduleForm.value.meetingTitle,
          settings: {
            host_video: this.editScheduleForm.value.HostVedio,
            participant_video: this.editScheduleForm.value.participantVdio,
            join_before_host: this.editScheduleForm.value.joinBeforeHost,
            auto_recording: this.editScheduleForm.value.auto_recording,
            waiting_room: true,
            use_pmi: false

          }
        }
        console.log(this.payload, "normal");
        this.data = { "meetingId": this.meetingId, "payload": this.payload }
        this.auth.updateMeeting(this.data).subscribe((res: any) => {
          console.log(res);
          if (res.status == true) {
            localStorage.removeItem('editType');
            localStorage.removeItem('occurenceId');
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Meeting Updated Successfully" } })
          }
          else {
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Update Meeting" } })
          }
          localStorage.removeItem('editType');
          this.editScheduleForm.reset()
          this.router.navigateByUrl('/home/meeting-list')
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
    }


  }

  getReccurance(reccurance: any) {
    console.log(reccurance);

    switch (reccurance) {
      case 1:
        this.Daily = true
        this.Monthly = false
        this.Weekly = false
        this.EndDate = true
        this.weeklyOccurson = false
        break;
      case 2:
        this.Daily = false
        this.Weekly = true
        this.Monthly = false
        this.EndDate = true
        this.weeklyOccurson = true
        this.getCurrentDay()
        break;
      case 3:
        this.Daily = false
        this.Weekly = false
        this.Monthly = true
        this.EndDate = true
        this.weeklyOccurson = false
        const monthly_week = 1
        const monthly_week_day = 1
        const repeatIntervalMonthly = 1
        const repeatIntervalWeekly = 1
        const repeatinterval = 1
        const dayValue = 1
        this.editScheduleForm.patchValue({
          monthly_week: monthly_week,
          monthly_week_day: monthly_week_day,
          monthlyOccurance: dayValue
        })
        this.selectedDays = repeatinterval
        this.selectedWeeks = repeatIntervalWeekly
        this.selectedMonths = repeatIntervalMonthly
        break;
      default:
    }
  }

  reccuranceMeeting(e: any) {
    if (e.target.checked) {
      this.reccurance = true
    }
    else {
      this.reccurance = false
      this.weeklyOccurson = false
      this.Daily = false
      this.Weekly = false
      this.Monthly = false
      this.EndDate = false
    }
  }
  autoRecord: any = false
  getData: any
  checkId:any
  getMeetingDetailsByMeetingId() {
    // this.getData={meetingId: this.meetingId}
    this.checkId = localStorage.getItem('occurenceId')
    if (this.checkId) {
      this.getData = { meetingId: this.meetingId, occurrence_id: this.checkId }
      console.log(this.getData);
    } else {
      this.getData = { meetingId: this.meetingId }
      console.log(this.getData);
    }
    this.auth.getMeetingDetailsByMeetingId(this.getData).subscribe((res: any) => {
      console.log(res, "edit res");
      console.log(res.meeting.settings.auto_recording);
      if (res.meeting.settings.auto_recording == "none") {
        this.editScheduleForm.patchValue({
          auto_recording: "none"
        })
      } else {
        this.enableRecordDiv = true
        this.autoRecord = true
        this.editScheduleForm.patchValue({
          auto_recording: res.meeting.settings.auto_recording
        })
      }
      // normal meeting edit
      if (res.meeting.type == 2) {
        this.reccuring = false
        this.date = res.meeting.start_time
        console.log(this.date, "dateeee");
        const originalTimeWithoutTZ = this.date.replace(/[TZ]/g, ' ');
        console.log(originalTimeWithoutTZ, "originalTimeWithoutTZ");
        this.formattedTime = this.datePipe.transform(originalTimeWithoutTZ, 'yyyy-MM-dd HH:mm')
        const duration = res.meeting.duration
        const min = Math.floor(duration / 60);
        this.Durationminutes = duration % 60
        this.Durationhours = min * 60
        console.log(this.Durationhours, " this.Durationhours");

        if (this.Durationhours == 0) {
          this.minutes = [
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        } else {
          this.minutes = [
            { "value": 0, "name": "0 minutes" },
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        }
        this.editScheduleForm.patchValue({
          meetingTitle: res.meeting.topic,
          timeZone: res.meeting.timezone,
          startDate: this.formattedTime,
          startTime: [''],
          reccuranceMeeting: false,
          reccuranceType: [''],
          DailyReccurance: [''],
          repeatInterval: [''],
          repeatIntervalWeekly: [''],
          repeatIntervalMonthly: [''],
          sun: [''],
          mon: [''],
          tue: [''],
          thu: [''],
          fri: [''],
          sat: [''],
          day: [''],
          hour: this.Durationhours,
          minutes: this.Durationminutes,
          monthlyOccurance: [''],
          monthly_week: [''],
          monthly_week_day: [''],
          endDate: this.formatedEndDate,
          repeat: [''],
          requireMeetingPassword: false,
          password: res.meeting.password,
          enableWaitingRoom: false,
          athunticatedUser: false,
          HostVedio: res.meeting.settings.host_video,
          participantVdio: res.meeting.settings.participant_video,
          joinBeforeHost: res.meeting.settings.join_before_host,
        })
        // this.manageScheduleMinutes(this.Durationhours)

      }
      // daily reccuring edit
      else if (res.meeting.type != 2 && res.meeting.recurrence.type == 1) {
        this.reccuring = true
        this.reccurance = true
        this.Daily = true
        this.EndDate = true
        // const checkId = localStorage.getItem('occurenceId')
        const type: any = localStorage.getItem('editType')
        if (this.checkId && type == 1) {
          console.log("this occurence");
          const occurrence = res.meeting.occurrences.find((item: any) => item.occurrence_id === this.checkId);
          console.log(occurrence.start_time, "sdfgn");
          this.date = occurrence.start_time
        } else {
          console.log("all occurence");
          this.date = res.meeting.start_time
        }
        console.log(this.date);
        const timestampWithoutZAndTime = this.date.replace("Z", "");
        console.log(this.date, "dateeee");
        const originalTime = new Date(this.date);
        const convertedTime = new Date(originalTime.getTime() - 19900000);
        this.formattedTime = convertedTime.toISOString().slice(0, 16);
        console.log(this.formattedTime, "formatted");

        // endDate time convertioin
        this.EnddateNotformated = res.meeting.recurrence.end_date_time
        console.log(this.EnddateNotformated, "Enddateeee");

        this.formatedEndDate = this.EnddateNotformated.replace(/T.*$/, '');
        console.log(this.formatedEndDate, "formattedEnddate");
        // time convertion
        // const duration = res.meeting.occurrences[0].duration
        const durationItem = res.meeting.occurrences.find((item: any) => item.occurrence_id === this.checkId);
        if (durationItem && durationItem.duration) {
          const duration = durationItem.duration;
          console.log(duration, "duration");
          console.log(typeof (duration)); // Confirming the type
          const min = Math.floor(duration / 60); // This gives the number of hours
          this.Durationminutes = duration % 60;  // Remaining minutes
          this.Durationhours = min * 60; // Keep hours as is, no need to multiply by 60
          console.log(this.Durationhours, " this.Durationhours");
          console.log(this.Durationminutes, " this.Durationminutes");
        } else {
          console.log("No valid duration found");
        }
        if (this.Durationhours == 0) {
          this.minutes = [
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        } else {
          this.minutes = [
            { "value": 0, "name": "0 minutes" },
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        }
        this.editScheduleForm.patchValue({
          meetingTitle: res.meeting.topic,
          timeZone: res.meeting.timezone,
          startDate: timestampWithoutZAndTime,
          startTime: [''],
          reccuranceMeeting: true,
          // reccuranceType: res.meeting.recurrence.type,
          DailyReccurance: [''],
          // repeatInterval: res.meeting.recurrence.repeat_interval,
          repeatIntervalWeekly: [''],
          repeatIntervalMonthly: [''],
          sun: [''],
          mon: [''],
          tue: [''],
          thu: [''],
          fri: [''],
          sat: [''],
          day: [''],
          hour: this.Durationhours,
          minutes: this.Durationminutes,
          monthlyOccurance: [''],
          monthly_week: [''],
          monthly_week_day: [''],
          endDate: this.formatedEndDate,
          requireMeetingPassword: false,
          password: res.meeting.password,
          enableWaitingRoom: false,
          athunticatedUser: false,
          HostVedio: res.meeting.settings.host_video,
          participantVdio: res.meeting.settings.participant_video,
          joinBeforeHost: res.meeting.settings.join_before_host,
        })
        this.selectedDays = res.meeting.recurrence.repeat_interval
        this.selectedReccuring = res.meeting.recurrence.type
        // this.manageScheduleMinutes(this.Durationhours)

      }
      // weekly meeting edit
      else if (res.meeting.type != 2 && res.meeting.recurrence.type == 2) {
        this.reccuring = true
        this.reccurance = true
        this.weeklyOccurson = true
        this.Weekly = true
        this.EndDate = true
        // console.log(res.meeting.occurrences[0].start_time,"ggggggg");
        const occurrence = res.meeting.occurrences.find((item: any) => item.occurrence_id === this.checkId);
        // const checkId = localStorage.getItem('occurenceId')
        if (this.checkId) {
          console.log("this occurence");
          const occurrence = res.meeting.occurrences.find((item: any) => item.occurrence_id === this.checkId);
          console.log(occurrence.start_time, "sdfgn");
          this.date = occurrence.start_time
        } else {
          console.log("all occurence");
          this.date = res.meeting.start_time
        }
        console.log(this.date);
        const timestampWithoutZAndTime = this.date.replace("Z", "");
        console.log(this.date, "dateeee");
        const originalTime = new Date(this.date);
        const convertedTime = new Date(originalTime.getTime() - 19900000); // 10 hours, 42 minutes, and 0 seconds in milliseconds
        this.formattedTime = convertedTime.toISOString().slice(0, 16);
        console.log(this.formattedTime, "formatted");
        // endDate time convertioin
        this.EnddateNotformated = res.meeting.recurrence.end_date_time
        console.log(this.date, "dateeee");
        // const endTime = new Date(this.EnddateNotformated);
        // const convertedendTime = new Date(endTime.getTime() - 19900000); // 10 hours, 42 minutes, and 0 seconds in milliseconds
        // this.formatedEndDate = convertedendTime.toISOString().slice(0, 16);
        // console.log(this.formattedTime, "formatted");
        this.formatedEndDate = this.EnddateNotformated.replace(/T.*$/, '');
        console.log(this.formatedEndDate, "formattedEnddate");
        // time convertion
        // const duration = res.meeting.occurrences[0].duration
        const durationItem = res.meeting.occurrences.find((item: any) => item.occurrence_id === this.checkId);
        if (durationItem && durationItem.duration) {
          const duration = durationItem.duration;
          console.log(duration, "duration");
          console.log(typeof (duration)); // Confirming the type
          const min = Math.floor(duration / 60); // This gives the number of hours
          this.Durationminutes = duration % 60;  // Remaining minutes
          this.Durationhours = min * 60; // Keep hours as is, no need to multiply by 60
          console.log(this.Durationhours, " this.Durationhours");
          console.log(this.Durationminutes, " this.Durationminutes");
        } else {
          console.log("No valid duration found");
        }
        if (this.Durationhours == 0) {
          this.minutes = [
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        } else {
          this.minutes = [
            { "value": 0, "name": "0 minutes" },
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        }
        const str = res.meeting.recurrence.weekly_days;
        const arr = JSON.parse(`[${str}]`);
        // console.log(arr,"aray");
        this.editScheduleForm.patchValue({
          meetingTitle: res.meeting.topic,
          timeZone: res.meeting.timezone,
          startDate: timestampWithoutZAndTime,
          startTime: [''],
          reccuranceMeeting: true,
          // reccuranceType: res.meeting.recurrence.type,
          DailyReccurance: [''],
          repeatInterval: [''],
          repeatIntervalWeekly: [''],
          repeatIntervalMonthly: [''],
          sun: [''],
          mon: [''],
          tue: [''],
          thu: [''],
          fri: [''],
          sat: [''],
          day: [''],
          hour: this.Durationhours,
          minutes: this.Durationminutes,
          weekly: arr,
          monthlyOccurance: [''],
          monthly_week: [''],
          monthly_week_day: [''],
          endDate: this.formatedEndDate,
          requireMeetingPassword: false,
          password: res.meeting.password,
          enableWaitingRoom: false,
          athunticatedUser: false,
          HostVedio: res.meeting.settings.host_video,
          participantVdio: res.meeting.settings.participant_video,
          joinBeforeHost: res.meeting.settings.join_before_host,
        })
        this.selectedWeeks = res.meeting.recurrence.repeat_interval
        this.selectedReccuring = res.meeting.recurrence.type
        // this.manageScheduleMinutes(this.Durationhours)
      }
      // Monthly Reccuring Edit
      else if (res.meeting.type != 2 && res.meeting.recurrence.type == 3) {
        this.reccuring = true
        this.reccurance = true
        this.Monthly = true
        this.EndDate = true
        // start date time convertuin
        // const checkId = localStorage.getItem('occurenceId')
        if (this.checkId) {
          console.log("this occurence");
          const occurrence = res.meeting.occurrences.find((item: any) => item.occurrence_id === this.checkId);
          console.log(occurrence.start_time, "sdfgn");
          this.date = occurrence.start_time
        } else {
          console.log("all occurence");
          this.date = res.meeting.start_time
        }
        // this.date = res.meeting.occurrences[0].start_time
        console.log(this.date);
        const timestampWithoutZAndTime = this.date.replace("Z", "");
        console.log(this.date, "dateeee");
        const originalTime = new Date(this.date);
        const convertedTime = new Date(originalTime.getTime() + 19900000); // 10 hours, 42 minutes, and 0 seconds in milliseconds
        this.formattedTime = convertedTime.toISOString().slice(0, 16);
        console.log(this.formattedTime, "formatted");
        // endDate time convertioin
        this.EnddateNotformated = res.meeting.recurrence.end_date_time
        console.log(this.EnddateNotformated, "dateeee");
        // const endTime = new Date(this.date);
        // const convertedendTime = new Date(endTime.getTime() + 19900000); // 10 hours, 42 minutes, and 0 seconds in milliseconds
        // this.formatedEndDate = convertedendTime.toISOString().slice(0, 16);
        // console.log(this.formattedTime, "formatted");
        this.formatedEndDate = this.EnddateNotformated.replace(/T.*$/, '');
        console.log(this.formatedEndDate, "formattedEnddate");
        // time convertion
        // const duration = res.meeting.occurrences[0].duration
        const durationItem = res.meeting.occurrences.find((item: any) => item.occurrence_id === this.checkId);
        if (durationItem && durationItem.duration) {
          const duration = durationItem.duration;
          console.log(duration, "duration");
          console.log(typeof (duration)); // Confirming the type
          const min = Math.floor(duration / 60); // This gives the number of hours
          this.Durationminutes = duration % 60;  // Remaining minutes
          this.Durationhours = min * 60; // Keep hours as is, no need to multiply by 60
          console.log(this.Durationhours, " this.Durationhours");
          console.log(this.Durationminutes, " this.Durationminutes");
        } else {
          console.log("No valid duration found");
        }
        if (this.Durationhours == 0) {
          this.minutes = [
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        } else {
          this.minutes = [
            { "value": 0, "name": "0 minutes" },
            { "value": 15, "name": "15 minutes" },
            { "value": 30, "name": "30 minutes" },
            { "value": 45, "name": "45 minutes" }
          ]
        }
        this.editScheduleForm.patchValue({
          meetingTitle: res.meeting.topic,
          timeZone: res.meeting.timezone,
          startDate: timestampWithoutZAndTime,
          startTime: [''],
          reccuranceMeeting: true,
          // reccuranceType: res.meeting.recurrence.type,
          DailyReccurance: [''],
          repeatInterval: [''],
          repeatIntervalWeekly: [''],
          // repeatIntervalMonthly: res.meeting.recurrence.repeat_interval,
          sun: [''],
          mon: [''],
          tue: [''],
          thu: [''],
          fri: [''],
          sat: [''],
          day: [''],
          hour: this.Durationhours,
          minutes: this.Durationminutes,
          monthlyOccurance: res.meeting.recurrence.monthly_day,
          monthly_week: res.meeting.recurrence.monthly_week,
          monthly_week_day: res.meeting.recurrence.monthly_week_day,
          endDate: this.formatedEndDate,
          requireMeetingPassword: false,
          password: res.meeting.password,
          enableWaitingRoom: false,
          athunticatedUser: false,
          HostVedio: res.meeting.settings.host_video,
          participantVdio: res.meeting.settings.participant_video,
          joinBeforeHost: res.meeting.settings.join_before_host,
        })
        // this.manageScheduleMinutes(this.Durationhours)
        this.selectedMonths = res.meeting.recurrence.repeat_interval
        this.selectedReccuring = res.meeting.recurrence.type
        const jsonString = res.meeting.recurrence
        console.log(jsonString, "res");
        const jsonLength = Object.keys(jsonString).length;
        console.log(jsonLength, "leng");
        if (jsonLength == 4) {
          this.dayValue = "day"
        }
        else {
          this.dayValue = " "
          this.weekvalue = "other"
        }
      }
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
  filteredTimeZones: any
  getTimezones() {
    this.auth.getTimeZones({ data: "data" }).subscribe((res: any) => {
      this.timeZones = res.timezone
      this.filteredTimeZones = res.timezone
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
  startTime: any = ''
  EndTime: any = ''


  convertToHoursMinutes() {
    const duration = 75
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60
    console.log(hours, "hours");
    console.log(minutes, "minuits");
    // return `${hours} hours and ${minutes} minutes`;
  }
  calculateDateAfterWeeks() {
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    const date = new Date(this.editScheduleForm.value.startDate);
    console.log(date, "date");
    console.log(this.selectedWeeks, "selectedWeeks");
    switch (this.selectedWeeks) {
      case 1:
        console.log(this.selectedWeeks);
        this.targetDate = new Date(date.getTime() + oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 2:
        this.targetDate = new Date(date.getTime() + 2 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 3:
        this.targetDate = new Date(date.getTime() + 3 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 4:
        this.targetDate = new Date(date.getTime() + 4 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 5:
        this.targetDate = new Date(date.getTime() + 5 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 6:
        this.targetDate = new Date(date.getTime() + 6 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 7:
        this.targetDate = new Date(date.getTime() + 7 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")

        break;
      case 8:
        this.targetDate = new Date(date.getTime() + 8 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 9:
        this.targetDate = new Date(date.getTime() + 9 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 10:
        this.targetDate = new Date(date.getTime() + 10 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 11:
        this.targetDate = new Date(date.getTime() + 11 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 12:
        this.targetDate = new Date(date.getTime() + 12 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      default:
        this.targetDate = null;
        console.log(this.targetDate);
        break;
    }
  }

  // month end date
  calculateDateAfterMonths() {
    const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000; // Approximate number of milliseconds in one month
    const date = new Date(this.editScheduleForm.value.startDate);
    console.log(this.selectedMonths, "months");
    switch (this.selectedMonths) {
      case 1:
        this.targetDateMonthly = new Date(date.getTime() + oneMonthInMilliseconds);
        console.log(this.targetDateMonthly);
        this.EndTime = this.datePipe.transform(this.targetDateMonthly, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 2:
        this.targetDateMonthly = new Date(date.getTime() + 2 * oneMonthInMilliseconds);
        console.log(this.targetDateMonthly);
        this.EndTime = this.datePipe.transform(this.targetDateMonthly, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 3:
        this.targetDateMonthly = new Date(date.getTime() + 3 * oneMonthInMilliseconds);
        console.log(this.targetDateMonthly);
        this.EndTime = this.datePipe.transform(this.targetDateMonthly, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      default:
        this.targetDateMonthly = null;
        break;
    }
  }

  // daily endDate
  // daily endDate

  calculateDateAfterDays() {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
    const date = new Date(this.editScheduleForm.value.startDate);
    console.log(this.selectedDays, "days");
    switch (this.selectedDays) {
      case 1:
        this.targetDateDaily = new Date(date.getTime() + oneDayInMilliseconds);
        console.log(this.targetDateDaily);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        console.log(this.formatedEndDate, "(this.formatedEndDate");

        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 2:
        this.targetDateDaily = new Date(date.getTime() + 2 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 3:
        this.targetDateDaily = new Date(date.getTime() + 3 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 4:
        this.targetDateDaily = new Date(date.getTime() + 4 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 5:
        this.targetDateDaily = new Date(date.getTime() + 5 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 6:
        this.targetDateDaily = new Date(date.getTime() + 6 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 7:
        this.targetDateDaily = new Date(date.getTime() + 7 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 8:
        this.targetDateDaily = new Date(date.getTime() + 8 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 9:
        this.targetDateDaily = new Date(date.getTime() + 9 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 10:
        this.targetDateDaily = new Date(date.getTime() + 10 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 11:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 12:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 13:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 14:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 15:
        this.targetDateDaily = new Date(date.getTime() + 15 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
    }
  }
  calculateDateOnTheBasisOfReccuranceType() {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; //one week in milliseconds
    const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;//one month in milisecinds
    const date = new Date(this.editScheduleForm.value.startDate);
    console.log(date, "date");
    console.log(this.selectedReccuring, "selectedReccuring");
    switch (this.selectedReccuring) {
      // 24 * 60 * 60 * 1000
      case 1: console.log(this.selectedReccuring);
        this.targetDate = new Date(date.getTime() + oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        console.log(this.formatedEndDate, "this.formatedEndDate");
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })

        }
        // this.editScheduleForm.patchValue({
        //   endDate: this.EndTime
        // })
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break
      case 2:
        this.targetDate = new Date(date.getTime() + oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        // this.editScheduleForm.patchValue({
        //   endDate: this.EndTime
        // })
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        this.selectedWeeks = 1
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      case 3:
        this.targetDate = new Date(date.getTime() + oneMonthInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        console.log(this.EndTime, "EndTime");
        // this.editScheduleForm.patchValue({
        //   endDate: this.EndTime,
        //   monthlyOccurance: 1,
        // })
        if (this.formatedEndDate > this.EndTime) {
          this.editScheduleForm.patchValue({
            endDate: this.formatedEndDate
          })
        }
        else {
          this.editScheduleForm.patchValue({
            endDate: this.EndTime
          })
        }
        this.selectedMonths = 1
        this.dayValue = "day"
        console.log(this.editScheduleForm.value.endDate, "scheduleForm")
        break;
      default:
        this.targetDate = null;
        console.log(this.targetDate);
        break;

    }
  }
  datvalueDefault() {
    console.log("heyyy");

    this.dayValue = ""
  }
  // manageScheduleMinutes(hours) {
  //   if (hours == 240) {
  //     console.log("heyy 4 hr");
  //     this.minutes = [
  //       { "value": 0, "name": "0 minutes" }
  //     ]
  //     this.editScheduleForm.patchValue({
  //       minutes: 0
  //     })
  //   }
  // }
  manageScheduleMinutes(hours: any) {
    switch (hours) {
      case 0:
        console.log("0 hour");
        this.minutes = [
          { "value": 15, "name": "15 minutes" },
          { "value": 30, "name": "30 minutes" },
          { "value": 45, "name": "45 minutes" }
        ]
        this.editScheduleForm.patchValue({
          minutes: 15
        })
        break;
      case 60:
        console.log("1 hour");
        this.minutes = [
          { "value": 0, "name": "0 minutes" },
          { "value": 15, "name": "15 minutes" },
          { "value": 30, "name": "30 minutes" },
          { "value": 45, "name": "45 minutes" }
        ]
        this.editScheduleForm.patchValue({
          minutes: 0
        })
        break;
      case 120:
        console.log("2 hour");
        this.minutes = [
          { "value": 0, "name": "0 minutes" },
          { "value": 15, "name": "15 minutes" },
          { "value": 30, "name": "30 minutes" },
          { "value": 45, "name": "45 minutes" }
        ]
        this.editScheduleForm.patchValue({
          minutes: 0
        })
        break;
      case 180:
        console.log("3 hour");
        this.minutes = [
          { "value": 0, "name": "0 minutes" },
          { "value": 15, "name": "15 minutes" },
          { "value": 30, "name": "30 minutes" },
          { "value": 45, "name": "45 minutes" }
        ]
        this.editScheduleForm.patchValue({
          minutes: 0
        })
        break;
      case 240:
        console.log("4 hour");
        this.minutes = [
          { "value": 0, "name": "0 minutes" }
        ]
        this.editScheduleForm.patchValue({
          minutes: 0
        })
        break;
      default:
        console.log("default");
        break;
    }
  }
  getCurrentDay() {
    const currentDate = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = daysOfWeek[currentDate.getDay()];
    console.log(`Today is ${currentDay}`);
    console.log(currentDay);
    switch (currentDay) {
      case "Sunday":
        this.daycheck = [1]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.editScheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Monday":
        this.daycheck = [2]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.editScheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Tuesday":
        this.daycheck = [3]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.editScheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Wednesday":
        this.daycheck = [4]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.editScheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Thursday":
        this.daycheck = [5]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.editScheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Friday":
        this.daycheck = [6]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.editScheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Saturday":
        this.daycheck = [7]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.editScheduleForm.patchValue({
          weekly: this.array
        })
        break;
      default:
    }
  }
  dateSelected(value: any) {
    console.log('Date selected:', value);
    this.EndTime = this.datePipe.transform(value, 'yyyy-MM-dd');
    console.log(this.EndTime);
    if (this.editScheduleForm.value.endDate > this.EndTime) {
      console.log("no change");

    } else {
      this.editScheduleForm.patchValue({
        endDate: this.EndTime
      })
    }

  }

  defaultEndTime() {
    this.timezone = localStorage.getItem('timeZone')
    const updatedStartTime = new Date()
    console.log("defaultEndTime:------", updatedStartTime);
    const formattedStartTime = format(utcToZonedTime(updatedStartTime, this.timezone), 'yyyy-MM-dd');
    console.log(formattedStartTime, "defaultEndTime333");
    this.EndTime = formattedStartTime
  }

  startTimeValidation() {
    this.timezone = localStorage.getItem('timeZone')
    const updatedStartTime = new Date()
    console.log("formattedStartTime:------", updatedStartTime);
    const formattedStartTime = format(utcToZonedTime(updatedStartTime, this.timezone), 'yyyy-MM-dd HH:mm');
    console.log(formattedStartTime, "formattedStartTime");
    this.startTime = formattedStartTime
  }

  enableRecordDiv = false
  enableRecording(e: any) {
    if (e.target.checked) {
      this.enableRecordDiv = true
      this.setRecordValue('cloud')
    }
    else {
      this.enableRecordDiv = false
      this.setRecordValue('none')
    }
  }
  setRecordValue(value: any) {
    console.log(value);
    this.editScheduleForm.patchValue({
      auto_recording: value
    })

  }
  manageMinits(value: any) {
    if (value == 0) {
      this.minutes = [
        { "value": 15, "name": "15 minutes" },
        { "value": 30, "name": "30 minutes" },
        { "value": 45, "name": "45 minutes" }
      ]
    } else {
      this.minutes = [
        { "value": 0, "name": "0 minutes" },
        { "value": 15, "name": "15 minutes" },
        { "value": 30, "name": "30 minutes" },
        { "value": 45, "name": "45 minutes" }
      ]
    }
  }
  setTime(data: any) {
    // const timeZone = data;
    // const currentTime = new Date();
    // const udpatedStartTime = addMinutes(currentTime, 2)
    // const updatedEndTime = addMinutes(currentTime, 7)
    // const startTime = format(utcToZonedTime(udpatedStartTime, timeZone), 'yyyy-MM-dd HH:mm');
    // const endTime = format(utcToZonedTime(updatedEndTime, timeZone), 'yyyy-MM-dd HH:mm');

    const timeZone = data;
    const currentTime = new Date();
    const udpatedStartTime = addMinutes(currentTime, 0);
    const minutes = udpatedStartTime.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    udpatedStartTime.setMinutes(roundedMinutes);
    udpatedStartTime.setSeconds(0);
    const startTime = format(utcToZonedTime(udpatedStartTime, timeZone), 'yyyy-MM-dd HH:mm');
    const updatedEndTime = addMinutes(currentTime, 7);
    const endTime = format(utcToZonedTime(updatedEndTime, timeZone), 'yyyy-MM-dd');
    this.editScheduleForm.patchValue({
      startDate: startTime,
      endDate: endTime
    })
  }
  timeValidation: any
  validation(data: any) {
    this.timezone = data;
    const currentTime = new Date();
    const updatedStartTime = addMinutes(currentTime, 0);
    const startTime = utcToZonedTime(updatedStartTime, this.timezone);
    this.timeValidation = startTime;
  }
  minitValidation(selectedDateTime: string) {
    const selectedDate = new Date(selectedDateTime);
    const selectedDateformattedTime = format(selectedDate, 'yyyy-MM-dd HH:mm');
    const currentUtcTime = new Date();
    const currentTimeInSelectedTimezone = utcToZonedTime(currentUtcTime, this.timezone);
    const formattedTime = format(currentTimeInSelectedTimezone, 'yyyy-MM-dd HH:mm');
    console.log(selectedDateformattedTime, "selectedDateformattedTime");
    console.log(formattedTime, "currentTimeInSelectedTimezone");

    // const selectedDate = new Date(selectedDateTime);
    // const selectedUtcTime = utcToZonedTime(selectedDate, this.timezone);
    // const currentUtcTime = utcToZonedTime(new Date(), this.timezone);
    if (selectedDateformattedTime < formattedTime) {
      this.snackBar.open("Please provide valid time", 'Close', {
        duration: 3000, // 3 seconds
      });
      // const updatedTime = format(currentUtcTime, 'yyyy-MM-dd HH:mm');
      this.editScheduleForm.patchValue({
        startDate: formattedTime // Update to the current time in the selected timezone
      });
    } else {
      console.log("Valid time selected.");
    }
  }
  SearchFilter: any
  filter() {
    if (!this.SearchFilter) {
      this.filteredTimeZones = this.timeZones;
      return;
    }

    const filterValue = this.SearchFilter.toLowerCase();

    this.filteredTimeZones = this.timeZones.filter((timeZone: any) =>
      timeZone.timezoneText.toLowerCase().includes(filterValue)
    );
  }
  disableEditInput: any
  getEditType() {
    const editType: any = localStorage.getItem('editType')
    console.log(editType, "/////////////////////////////////////////////////////////");

    if (editType) {
      if (editType === '1') {
        this.disableEditInput = true
        console.warn("this occurence only")
      } else {
        this.disableEditInput = false
        console.warn("all occurences")
      }
    } else {
      console.log("normal");

    }
  }
  occurenceId: any
  editRec() {
    console.log(this.editScheduleForm.value, "scheduleee");
    console.log(this.editScheduleForm.value.reccuranceType)
    this.duration = this.editScheduleForm.value.hour + this.editScheduleForm.value.minutes
    console.log(this.duration, "duration");
    const startDateValue = this.editScheduleForm.value.startDate;
    console.log(startDateValue);
    
    // const startDate = new Date(startDateValue);
    // this.formattedDate = this.datePipe.transform(startDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ');
    const timeZone = this.editScheduleForm.value.timeZone;         
    const localMoment = moment.tz(startDateValue, 'YYYY-MM-DD HH:mm', timeZone);
    const convertedTime = localMoment.clone().tz(timeZone);
    this.formattedDate = convertedTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    console.log(this.formattedDate, "formated");
    const checkId = localStorage.getItem('occurenceId')
    if (checkId) {
      this.occurenceId = checkId
    } else {

    }
    const payload = {
      "occurrence_id": this.occurenceId,
      "meetingId": this.meetingId,
      "payload": {
        "duration": this.duration,
        "start_time": this.formattedDate,
        "settings": {
          host_video: this.editScheduleForm.value.HostVedio,
          participant_video: this.editScheduleForm.value.participantVdio,
          join_before_host: this.editScheduleForm.value.joinBeforeHost,
          auto_recording: this.editScheduleForm.value.auto_recording,
          waiting_room: true,
          use_pmi: false
        }
      }
    }
    console.log(payload, "normal");
    // this.data = { "meetingId": this.meetingId, "payload": this.payload }
    this.auth.updateOneoccurence(payload).subscribe((res: any) => {
      console.log(res);
      if (res.status == true) {
        this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Meeting Updated Successfully" } })
        localStorage.removeItem('occurenceId')
      }
      else {
        this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Update Meeting" } })
      }
      localStorage.removeItem('occurenceId')
      this.editScheduleForm.reset()
      this.router.navigateByUrl('/home/meeting-list')
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
  disableNumberKeys() {
    window.addEventListener('keydown', this.preventNumberKeys);
  }
  
  enableNumberKeys() {
    window.removeEventListener('keydown', this.preventNumberKeys);
  }
  
  preventNumberKeys(event: KeyboardEvent) {
    const isNumberKey = event.key >= '0' && event.key <= '9';
    if (isNumberKey) {
      event.preventDefault(); // Prevents number keys from functioning
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ScheduleMeetingService } from 'src/services/schedule-meeting/schedule-meeting.service';
import { PopupComponent } from '../shared/popup/popup.component';

import { addMinutes, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import { DatePipe } from '@angular/common';
import { AuthguardService } from 'src/services/authguard/auth.service';
import { MeetingSuccessfullPopUpComponent } from '../shared/popup/meeting-successfull-pop-up/meeting-successfull-pop-up.component';
import { LoginService } from 'src/services/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-schedule-meeting',
  templateUrl: './schedule-meeting.component.html',
  styleUrls: ['./schedule-meeting.component.css']
})
export class ScheduleMeetingComponent implements OnInit {
  scheduleForm!: FormGroup
  Monthly = false
  Weekly = false
  Daily = false
  EndDate = false
  reccurance = false
  timeZones: any = []
  weeklyDays: any

  timezone: any

  userName: any
  duration: any
  formattedDate: any
  randomPassword: any

  formatedEndDate: any

  data: any = {}
  payload: any
  test: any = {}

  // enddate filter
  targetDate: any
  selectedWeeks: any
  calculatedDate: any
  selectedMonths: any
  targetDateMonthly: any
  selectedDays: any
  targetDateDaily: any
  selectedReccuring: any

  dayValue = "day"
  selectedRowIndex: any = "other"
  // daycheck
  daycheck: any
  array: any
  isLoading: boolean = false
  testDAte: any

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
  monthly_week: any = [
    { "name": "First", "value": 1 },
    { "name": "Second", "value": 2 },
    { "name": "Third", "value": 3 },
    { "name": "Fourth", "value": 4 },
    { "name": "Last", "value": -1 }
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
    { "name": "Wednesday", "value": 4 },
    { "name": "Thursday", "value": 5 },
    { "name": "Friday", "value": 6 },
    { "name": "Saturday", "value": 7 }
  ];


  constructor(private router: Router, private fb: FormBuilder, private auth: ScheduleMeetingService, private popUp: MatDialog, private datePipe: DatePipe, private service: AuthguardService, private loginService: LoginService, private snackBar: MatSnackBar) {
    this.scheduleForm = this.fb.group({
      meetingTitle: ['', Validators.required],
      weekly: new FormControl(''),
      timeZone: [''],
      startDate: [''],
      startTime: [''],
      hour: [''],
      minutes: [],
      reccuranceMeeting: false,
      reccuranceType: [''],
      DailyReccurance: [''],
      repeatInterval: [],
      repeatIntervalWeekly: [''],
      repeatIntervalMonthly: [''],
      monthlyOccurance: [''],
      monthly_week: [''],
      monthly_week_day: [''],
      day: [''],
      endDate: [''],
      repeat: [''],
      requireMeetingPassword: false,
      password: ['', Validators.required],
      enableWaitingRoom: true,
      athunticatedUser: false,
      HostVedio: false,
      participantVdio: false,
      audioOption: false,
      joinBeforeHost: false,
      auto_recording: ['']
    })
  }

  testData = [
    { value: '1', name: 'sun' },
    { value: '2', name: 'mon' },
    { value: '3', name: 'tue' },
    { value: '4', name: 'wed' }
  ];

  ngOnInit(): void {
    this.timezone = localStorage.getItem('timeZone')
    this.getTimezones()
    this.defaultValueSet()
    this.generatePassword()
    // this.userName = localStorage.getItem('userName')
    // this.userName = this.userName.replace('mtn.', '')
    this.userName = localStorage.getItem('email')
    this.getCurrentDay()


  }

  route() {
    this.router.navigateByUrl('/home/meeting-list')
  }


  getReccurance(reccurance: any) {
    switch (reccurance) {
      case 1:
        this.Daily = true
        this.Monthly = false
        this.Weekly = false
        this.EndDate = true
        break;
      case 2:
        this.Daily = false
        this.Weekly = true
        this.Monthly = false
        this.EndDate = true
        break;
      case 3:
        this.Daily = false
        this.Weekly = false
        this.Monthly = true
        this.EndDate = true
        break
      default:
    }

  }


  //function to show the row
  reccuranceMeeting(e: any) {
    if (e.target.checked) {
      this.reccurance = true
      this.Daily = true
      this.EndDate = true
    }
    else {
      this.reccurance = false
      this.Daily = false
      this.Weekly = false
      this.Monthly = false
      this.EndDate = false
    }
  }

  // function to fetch all timezones
  filteredTimeZones: any
  getTimezones() {
    this.auth.getTimeZones({ data: "data" }).subscribe((res: any) => {
      this.timeZones = res.timezone
      this.filteredTimeZones = res.timezone;
    }, (err) => {
      if (err.status = 401) {
        console.log("error", err);
        this.service.logout()
      }
      else {
        console.log(err);
        this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Server not available or not reachable. Please try again later." } })
      }
    })
  }

  save() {
    // starttime convertion
    this.isLoading = true
    this.duration = this.scheduleForm.value.hour + this.scheduleForm.value.minutes
    const startDateValue = this.scheduleForm.value.startDate;
    const startDate = new Date(startDateValue);
    // this.formattedDate = this.datePipe.transform(startDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ');

    const timeZone = this.scheduleForm.value.timeZone;         
    const localMoment = moment.tz(startDateValue, 'YYYY-MM-DD HH:mm', timeZone);
    const convertedTime = localMoment.clone().tz(timeZone);
    const formattedTime = convertedTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.formattedDate = formattedTime;
    if (this.scheduleForm.value.reccuranceMeeting == true && this.scheduleForm.value.reccuranceType == 1) {
      //  endtime convertion
      const reopeatinterval = this.scheduleForm.value.endDate
      this.formatedEndDate = reopeatinterval + "T23:59:00Z"
      // payload for reccuring meeting
      this.payload = {
        type: "8",
        duration: this.duration,
        start_time: this.formattedDate,
        timezone: this.scheduleForm.value.timeZone,
        password: this.scheduleForm.value.password,
        topic: this.scheduleForm.value.meetingTitle,
        settings: {
          host_video: this.scheduleForm.value.HostVedio,
          participant_video: this.scheduleForm.value.participantVdio,
          join_before_host: this.scheduleForm.value.joinBeforeHost,
          auto_recording: this.scheduleForm.value.auto_recording,
          waiting_room: true,
          use_pmi: false,
        },
        recurrence: {
          end_date_time: this.formatedEndDate,
          repeat_interval: this.scheduleForm.value.repeatInterval,
          type: "1",
        },
      }
      console.log(this.payload, "this.payload");

      this.data = { "email": this.userName, "payload": this.payload }
      this.auth.scheduleMeeting(this.data).subscribe((res: any) => {
        this.isLoading = false
        if (res.status == true) {
          this.popUp.open(MeetingSuccessfullPopUpComponent, { width: "550px", height: "250px", data: { message: "Meeting Scheduled Successfully", clipboardData: res, password: this.scheduleForm.value.password, topic: this.scheduleForm.value.meetingTitle, time: this.formattedDate,timezone: this.scheduleForm.value.timeZone } })
        }
        else {
          this.popUp.open(PopupComponent, { width: "550px", height: "300px", data: { message: "Unable to Create Meeting" } })
        }
        this.scheduleForm.reset()
        // this.router.navigateByUrl('/home/meeting-list')
        this.setProfileNotification(true)
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
    else if (this.scheduleForm.value.reccuranceMeeting == true && this.scheduleForm.value.reccuranceType == 2) {
      const array: any = this.scheduleForm.value.weekly;
      this.weeklyDays = array.join(', ');
      const reopeatinterval = this.scheduleForm.value.endDate
      const endDate = new Date(reopeatinterval)
      this.formatedEndDate = reopeatinterval + "T23:59:00Z"

      this.payload = {
        type: "8",
        duration: this.duration,
        start_time: this.formattedDate,
        timezone: this.scheduleForm.value.timeZone,
        password: this.scheduleForm.value.password,
        topic: this.scheduleForm.value.meetingTitle,
        settings: {
          host_video: this.scheduleForm.value.HostVedio,
          participant_video: this.scheduleForm.value.participantVdio,
          join_before_host: this.scheduleForm.value.joinBeforeHost,
          auto_recording: this.scheduleForm.value.auto_recording,
          waiting_room: true,
          use_pmi: false
        },
        recurrence: {
          end_date_time: this.formatedEndDate,
          repeat_interval: this.scheduleForm.value.repeatIntervalWeekly,
          type: "2",
          weekly_days: (this.weeklyDays)
        },
      }
      console.log(this.payload, "this.payload");

      this.data = { "email": this.userName, "payload": this.payload }
      this.auth.scheduleMeeting(this.data).subscribe((res: any) => {
        this.isLoading = false
        if (res.status == true) {
          this.popUp.open(MeetingSuccessfullPopUpComponent, { width: "550px", height: "250px", data: { message: "Meeting Scheduled Successfully", clipboardData: res, password: this.scheduleForm.value.password, topic: this.scheduleForm.value.meetingTitle, time: this.formattedDate,timezone: this.scheduleForm.value.timeZone } })
        }
        else {
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Create Meeting" } })
        }
        this.scheduleForm.reset()
        this.setProfileNotification(true)
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
    else if (this.scheduleForm.value.reccuranceMeeting == true && this.scheduleForm.value.reccuranceType == 3) {
      if (this.scheduleForm.value.day == "day") {
        const reopeatinterval = this.scheduleForm.value.endDate
        this.formatedEndDate = reopeatinterval + "T23:59:00Z"
        this.payload = {
          type: "8",
          duration: this.duration,
          start_time: this.formattedDate,
          timezone: this.scheduleForm.value.timeZone,
          password: this.scheduleForm.value.password,
          topic: this.scheduleForm.value.meetingTitle,
          settings: {
            host_video: this.scheduleForm.value.HostVedio,
            participant_video: this.scheduleForm.value.participantVdio,
            join_before_host: this.scheduleForm.value.joinBeforeHost,
            auto_recording: this.scheduleForm.value.auto_recording,
            waiting_room: true,
            use_pmi: false
          },
          recurrence: {
            end_date_time: this.formatedEndDate,
            monthly_day: this.scheduleForm.value.monthlyOccurance,
            repeat_interval: this.scheduleForm.value.repeatIntervalMonthly,
            type: '3',
          },
        }
        console.log(this.payload, "this.payload");
        this.data = { "email": this.userName, "payload": this.payload }
        this.auth.scheduleMeeting(this.data).subscribe((res: any) => {
          this.isLoading = false
          if (res.status == true) {
            this.popUp.open(MeetingSuccessfullPopUpComponent, { width: "550px", height: "250px", data: { message: "Meeting Scheduled Successfully", clipboardData: res, password: this.scheduleForm.value.password, topic: this.scheduleForm.value.meetingTitle, time: this.formattedDate,timezone: this.scheduleForm.value.timeZone } })
          }
          else {
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Create Meeting" } })
          }
          this.scheduleForm.reset()
          this.setProfileNotification(true)
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
      else if (this.scheduleForm.value.day != "day") {
        const reopeatinterval = this.scheduleForm.value.endDate
        this.formatedEndDate = reopeatinterval + "T23:59:00Z"
        this.payload = {
          type: "8",
          duration: this.duration,
          start_time: this.formattedDate,
          timezone: this.scheduleForm.value.timeZone,
          password: this.scheduleForm.value.password,
          topic: this.scheduleForm.value.meetingTitle,
          settings: {
            host_video: this.scheduleForm.value.HostVedio,
            participant_video: this.scheduleForm.value.participantVdio,
            join_before_host: this.scheduleForm.value.joinBeforeHost,
            auto_recording: this.scheduleForm.value.auto_recording,
            waiting_room: true,
            use_pmi: false
          },
          recurrence: {
            end_date_time: this.formatedEndDate,
            monthly_week: this.scheduleForm.value.monthly_week,
            monthly_week_day: this.scheduleForm.value.monthly_week_day,
            repeat_interval: this.scheduleForm.value.repeatIntervalMonthly,
            type: '3',
          },
        }
        console.log(this.payload, "this.payload");
        this.data = { "email": this.userName, "payload": this.payload }
        this.auth.scheduleMeeting(this.data).subscribe((res: any) => {
          this.isLoading = false
          if (res.status == true) {
            this.popUp.open(MeetingSuccessfullPopUpComponent, { width: "550px", height: "250px", data: { message: "Meeting Scheduled Successfully", clipboardData: res, password: this.scheduleForm.value.password, topic: this.scheduleForm.value.meetingTitle, time: this.formattedDate,timezone: this.scheduleForm.value.timeZone } })
          }
          else {
            this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Create Meeting" } })
          }
          this.scheduleForm.reset()
          this.router.navigateByUrl('/home/meeting-list')
        }, err => {
          console.log(err);
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
      this.payload = {
        type: "2",
        duration: this.duration,
        start_time: this.formattedDate,
        timezone: this.scheduleForm.value.timeZone,
        password: this.scheduleForm.value.password,
        topic: this.scheduleForm.value.meetingTitle,
        settings: {
          host_video: this.scheduleForm.value.HostVedio,
          participant_video: this.scheduleForm.value.participantVdio,
          join_before_host: this.scheduleForm.value.joinBeforeHost,
          auto_recording: this.scheduleForm.value.auto_recording,
          waiting_room: true,
          use_pmi: false
        }
      }
      console.log(this.payload, "this.payload");
      this.data = { "email": this.userName, "payload": this.payload }
      this.auth.scheduleMeeting(this.data).subscribe((res: any) => {
        this.isLoading = false
        if (res.status == true) {
          this.popUp.open(MeetingSuccessfullPopUpComponent, { width: "550px", height: "250px", data: { message: "Meeting Scheduled Successfully", clipboardData: res, password: this.scheduleForm.value.password, topic: this.scheduleForm.value.meetingTitle, time: this.formattedDate, timezone: this.scheduleForm.value.timeZone } })
        }
        else {
          this.popUp.open(PopupComponent, { width: "550px", height: "250px", data: { message: "Unable to Create Meeting" } })
        }
        this.scheduleForm.reset()
        // this.router.navigateByUrl('/home/meeting-list')
        this.setProfileNotification(true)
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

  generatePassword() {
    const characters = "0123456789";
    let generatedPassword = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedPassword += characters.charAt(randomIndex);
    }
    this.randomPassword = generatedPassword;
    this.scheduleForm.patchValue({
      password: this.randomPassword
    })
  }

  startTime: any = ''
  EndTime: any = ''

  defaultValueSet() {
    // const currentTime = new Date();
    // const updatedStartTime = addMinutes(currentTime, 0)
    // console.log(updatedStartTime,"updatedStartTime");

    // const formattedStartTime = format(utcToZonedTime(updatedStartTime, this.timezone), 'yyyy-MM-dd HH:mm');
    // console.log(formattedStartTime,"formattedStartTime");

    // this.startTime = formattedStartTime
    // console.log(this.startTime,"this.startTime>>>>>>>>>>>>>>>>>>>");
    const currentTime = new Date();
    const minutes = currentTime.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    currentTime.setMinutes(roundedMinutes);
    currentTime.setSeconds(0);
    const formattedStartTime = format(utcToZonedTime(currentTime, this.timezone), 'yyyy-MM-dd HH:mm');
    console.log(formattedStartTime, "formattedStartTime");
    this.startTime = formattedStartTime;
    console.log(this.startTime, "this.startTime>>>>>>>>>>>>>>>>>>>");

    this.timeValidation = this.startTime

    const udpdatedEndTime = addMinutes(currentTime, 7)
    const futureDate = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
    const formatedFutureDate = format(utcToZonedTime(futureDate, this.timezone), 'yyyy-MM-dd');
    this.EndTime = formatedFutureDate
    const formattedEndTime = format(utcToZonedTime(udpdatedEndTime, this.timezone), 'yyyy-MM-dd HH:mm');
    const hour = 0
    const minuits = 30
    const reccuranceType = 1
    const repeatdays = 3
    const monthlyOccurance = 1
    const monthly_week = 1
    const monthly_week_day = 1
    const repeatIntervalMonthly = 1
    const repeatIntervalWeekly = 1
    const repeatinterval = 1
    if (hour == 0) {
      this.minutes = [
        { "value": 15, "name": "15 minutes" },
        { "value": 30, "name": "30 minutes" },
        { "value": 45, "name": "45 minutes" }
      ]
    }
    this.scheduleForm.patchValue({
      hour: hour,
      minutes: minuits,
      repeatInterval: repeatdays,
      startDate: formattedStartTime,
      endDate: formatedFutureDate,
      monthlyOccurance: monthlyOccurance,
      monthly_week: monthly_week,
      monthly_week_day: monthly_week_day,
      timeZone: this.timezone,
      auto_recording: "none"
    })
    this.selectedDays = repeatinterval
    this.selectedWeeks = repeatIntervalWeekly
    this.selectedMonths = repeatIntervalMonthly
    this.selectedReccuring = reccuranceType

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
    this.scheduleForm.patchValue({
      startDate: startTime,
      endDate: endTime
    })
  }


  calculateDateAfterWeeks() {
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    const date = new Date(this.scheduleForm.value.startDate);
    switch (this.selectedWeeks) {
      case 1:
        this.targetDate = new Date(date.getTime() + oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 2:
        this.targetDate = new Date(date.getTime() + 2 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })


        break;
      case 3:
        this.targetDate = new Date(date.getTime() + 3 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 4:
        this.targetDate = new Date(date.getTime() + 4 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 5:
        this.targetDate = new Date(date.getTime() + 5 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 6:
        this.targetDate = new Date(date.getTime() + 6 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 7:
        this.targetDate = new Date(date.getTime() + 7 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })

        break;
      case 8:
        this.targetDate = new Date(date.getTime() + 8 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 9:
        this.targetDate = new Date(date.getTime() + 9 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 10:
        this.targetDate = new Date(date.getTime() + 10 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 11:
        this.targetDate = new Date(date.getTime() + 11 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 12:
        this.targetDate = new Date(date.getTime() + 12 * oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      default:
        this.targetDate = null;
        break;
    }
  }
  // month end date
  calculateDateAfterMonths() {
    const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000; // Approximate number of milliseconds in one month
    const date = new Date(this.scheduleForm.value.startDate);
    switch (this.selectedMonths) {
      case 1:
        this.targetDateMonthly = new Date(date.getTime() + oneMonthInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateMonthly, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 2:
        this.targetDateMonthly = new Date(date.getTime() + 2 * oneMonthInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateMonthly, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 3:
        this.targetDateMonthly = new Date(date.getTime() + 3 * oneMonthInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateMonthly, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      default:
        this.targetDateMonthly = null;
        break;
    }
  }

  // daily endDate

  calculateDateAfterDays() {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
    const date = new Date(this.scheduleForm.value.startDate);
    switch (this.selectedDays) {
      case 1:
        this.targetDateDaily = new Date(date.getTime() + oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 2:
        this.targetDateDaily = new Date(date.getTime() + 2 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 3:
        this.targetDateDaily = new Date(date.getTime() + 3 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 4:
        this.targetDateDaily = new Date(date.getTime() + 4 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 5:
        this.targetDateDaily = new Date(date.getTime() + 5 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 6:
        this.targetDateDaily = new Date(date.getTime() + 6 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 7:
        this.targetDateDaily = new Date(date.getTime() + 7 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 8:
        this.targetDateDaily = new Date(date.getTime() + 8 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 9:
        this.targetDateDaily = new Date(date.getTime() + 9 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 10:
        this.targetDateDaily = new Date(date.getTime() + 10 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 11:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 12:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 13:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 14:
        this.targetDateDaily = new Date(date.getTime() + 11 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 15:
        this.targetDateDaily = new Date(date.getTime() + 15 * oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDateDaily, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;

    }


  }

  calculateDateOnTheBasisOfReccuranceType() {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; //one week in milliseconds
    const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;//one month in milisecinds
    const date = new Date(this.scheduleForm.value.startDate);
    switch (this.selectedReccuring) {
      // 24 * 60 * 60 * 1000
      case 1:
        this.targetDate = new Date(date.getTime() + oneDayInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 2:
        this.targetDate = new Date(date.getTime() + oneWeekInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      case 3:
        this.targetDate = new Date(date.getTime() + oneMonthInMilliseconds);
        this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
        this.scheduleForm.patchValue({
          endDate: this.EndTime
        })
        break;
      default:
        this.targetDate = null;
        break;
    }
  }

  datvalueDefault() {
    this.dayValue = ""
  }

  // manageScheduleMinutes(hours: any) {
  //   switch (hours) {
  //     case 0:
  //       this.minutes = [
  //         { "value": 15, "name": "15 minutes" },
  //         { "value": 30, "name": "30 minutes" },
  //         { "value": 45, "name": "45 minutes" }
  //       ]
  //       this.scheduleForm.patchValue({
  //         minutes: 15
  //       })
  //       break;
  //     case 60:
  //       this.minutes = [
  //         { "value": 0, "name": "0 minutes" },
  //         { "value": 15, "name": "15 minutes" },
  //         { "value": 30, "name": "30 minutes" },
  //         { "value": 45, "name": "45 minutes" }
  //       ]
  //       this.scheduleForm.patchValue({
  //         minutes: 0
  //       })
  //       break;
  //     case 120:
  //       this.minutes = [
  //         { "value": 0, "name": "0 minutes" },
  //         { "value": 15, "name": "15 minutes" },
  //         { "value": 30, "name": "30 minutes" },
  //         { "value": 45, "name": "45 minutes" }
  //       ]
  //       this.scheduleForm.patchValue({
  //         minutes: 0
  //       })
  //       break;
  //     case 180:
  //       this.minutes = [
  //         { "value": 0, "name": "0 minutes" },
  //         { "value": 15, "name": "15 minutes" },
  //         { "value": 30, "name": "30 minutes" },
  //         { "value": 45, "name": "45 minutes" }
  //       ]
  //       this.scheduleForm.patchValue({
  //         minutes: 0
  //       })
  //       break;
  //     case 240:
  //       this.minutes = [
  //         { "value": 0, "name": "0 minutes" }
  //       ]
  //       this.scheduleForm.patchValue({
  //         minutes: 0
  //       })
  //       break;
  //     default:
  //       break;
  //   }
  // }


  dateSelected(value: any) {
    // this.EndTime = this.datePipe.transform(value, 'yyyy-MM-dd');
    // this.scheduleForm.patchValue({
    //   endDate: this.EndTime
    // })
    console.log(this.scheduleForm.value.reccuranceType, this.scheduleForm.value.repeatInterval, this.selectedReccuring);
    // if (this.scheduleForm.value.reccuranceType != 1) {
    this.calculateDateOnTheBasisOfReccuranceType()
    switch (this.selectedReccuring) {
      case 1:
        this.calculateDateOnTheBasisOfReccuranceType()
        this.calculateDateAfterDays()
        break;
      case 2:
        this.calculateDateOnTheBasisOfReccuranceType()
        this.calculateDateAfterWeeks()
        break;
      case 3:
        this.calculateDateOnTheBasisOfReccuranceType()
        this.calculateDateAfterMonths()
        break;
      default:
        console.log("error");

        break;
    }


    // } else {
    //   const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
    //   const date = new Date(this.scheduleForm.value.startDate);
    //   this.targetDate = new Date(date.getTime() + oneDayInMilliseconds);
    //   this.EndTime = this.datePipe.transform(this.targetDate, 'yyyy-MM-dd');
    //   this.scheduleForm.patchValue({
    //     endDate: this.EndTime
    //   })
    // }
  }

  getCurrentDay() {
    const currentDate = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = daysOfWeek[currentDate.getDay()];
    switch (currentDay) {
      case "Sunday":
        this.daycheck = [1]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.scheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Monday":
        this.daycheck = [2]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.scheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Tuesday":
        this.daycheck = [3]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.scheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Wednesday":
        this.daycheck = [4]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.scheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Thursday":
        this.daycheck = [5]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.scheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Friday":
        this.daycheck = [6]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.scheduleForm.patchValue({
          weekly: this.array
        })
        break;
      case "Saturday":
        this.daycheck = [7]
        this.array = JSON.parse(`[${this.daycheck}]`);
        this.scheduleForm.patchValue({
          weekly: this.array
        })
        break;
      default:
    }
  }
  styling(data: any) {
    switch (data) {
      case 1: {
        this.selectedRowIndex = "other"
        break;
      }
      case 2: {
        this.selectedRowIndex = "day"
        break;
      }
      default: {
        console.log("wronggggg");

      }

    }
  }
  setProfileNotification(type: any) {
    this.loginService.setProfileRoute(type)
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
    this.scheduleForm.patchValue({
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

  // timeValidation: any;
  // validation(data: any) {
  //   console.log("hii");
  //   const timeZone = data;
  //   const currentTime = new Date();
  //   const updatedStartTime = addMinutes(currentTime, 0);
  //   const startTime = utcToZonedTime(updatedStartTime, timeZone);
  //   this.timeValidation = startTime;
  //   console.log(startTime, 'startTime');
  //   console.log(this.timeValidation);
  // }
  // minitValidation(selectedDateTime: string) {
  //   const selectedDate = new Date(selectedDateTime);
  //   const selectedUtcTime = utcToZonedTime(selectedDate, this.timezone);
  //   console.log(this.timeValidation, "this.timeValidation");
  //   console.log(selectedUtcTime, "selectedUtcTime");
  //   const currentUtcTime = utcToZonedTime(new Date(), this.timezone);
  //   // Compare Date objects directly
  //   if (selectedUtcTime < currentUtcTime) {
  //     this.snackBar.open("Please provide valid time", 'Close', {
  //       duration: 3000, // 3 seconds
  //     });
  //     this.scheduleForm.patchValue({
  //       startDate: format(currentUtcTime, 'yyyy-MM-dd HH:mm') // Format and set the current time
  //     });
  //   } else {
  //     console.log("Valid time selected.");
  //   }

  timeValidation: any;

  validation(data: any) {
    console.log("hii");
    this.timezone = data;
    const currentTime = new Date();
    const updatedStartTime = addMinutes(currentTime, 0);
    const startTime = utcToZonedTime(updatedStartTime, this.timezone);
    this.timeValidation = startTime;
    console.log(startTime, 'startTime');
    console.log(this.timeValidation);
  }

  minitValidation(selectedDateTime: string) {
    const selectedDate = new Date(selectedDateTime);
    const selectedDateformattedTime = format(selectedDate, 'yyyy-MM-dd HH:mm');
    const currentUtcTime = new Date();
    const currentTimeInSelectedTimezone = utcToZonedTime(currentUtcTime, this.timezone);
    const formattedTime = format(currentTimeInSelectedTimezone, 'yyyy-MM-dd HH:mm');
    if (selectedDateformattedTime < formattedTime) {
      this.snackBar.open("Please provide valid time", 'Close', {
        duration: 3000,
      });
      this.scheduleForm.patchValue({
        startDate: formattedTime
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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleMeetingService {
  token: any = localStorage.getItem('token');
  userName: any = localStorage.getItem('email')

  ngOnInit(): void {
    // this.userName = this.userName.replace('mtn.', '')
  }

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': this.token,
    'email': this.userName
  });

  private refreshPage = new Subject<void>

  get reload() {
    return this.refreshPage
  }

  getTimeZones(data: any) {
    return this.http.post('/api/fetchTimezone', data, { headers: this.headers })
  }

  scheduleMeeting(data: any) {
    return this.http.post('/api/scheduleMeeting', data, { headers: this.headers }).pipe(
      tap(() => {
        this.reload.next()
      })
    )
  }

  // ----------------------edit-------------------------------

  getMeetingDetailsByMeetingId(data: any) {
    return this.http.post('/api/mtnGetMeetingWithId', data, { headers: this.headers })
  }
  updateMeeting(data: any) {
    return this.http.post('/api/mtnUpdateMeeting', data, { headers: this.headers })
  }
  updateOneoccurence(data:any){
    return this.http.post('/api/updateReccuringMeeting', data, { headers: this.headers })
  }

}

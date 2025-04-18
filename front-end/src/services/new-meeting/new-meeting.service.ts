import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NewMeetingService {
  token: any = localStorage.getItem('token') ?? '';
  userName: any = localStorage.getItem('email')

  ngOnInit(): void {
    this.userName = localStorage.getItem('email')
    // this.userName = this.userName.replace('mtn.', '') !
  }

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': this.token,
    'email': this.userName
  });

  constructor(private http: HttpClient) { }

  instantMeeting(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    return this.http.post('/api/instantMeeting', data, { headers: this.headers })
  }

  checkHostbalance(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    return this.http.post('/api/checkHostbalance', data, { headers: this.headers })
  }
  mtnUpdateUserLicense(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    return this.http.post('/api/mtnUpdateUserLicense', data, { headers: this.headers })
  }
  // api to check the app maintatnance
  checkVersionUpdate(data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'cbedd5a4b977c40e093d009b034988f6978ed0d60e04b2458c',
      // 'email': this.userName
    });
    return this.http.post('/api/Version', data, { headers: headers })
  }

}


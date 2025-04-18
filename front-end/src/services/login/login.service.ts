import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  timezoneToken: any
  token = 'cbedd5a4b977c40e093d009b034988f6978ed0d60e04b2458c'

  ngOnInit(): void {
    // this.userName = this.userName.replace('mtn.', '') !
  }
  private profileBasedubject = new BehaviorSubject<{ profile: any }>({ profile: '' });
  constructor(private http: HttpClient) { }


  login(data: any) {
    return this.http.post('/api/userLogin', data)
  }

  joinMeeting(data: any) {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token
    });

    return this.http.post('/api/signature', data, { headers: headers })
  }

  //----------------------------------------generatePassword----------------------------------------//


  getData(data: any) {
    console.log(data.authenticationToken, "from service");
    const token = data.authenticationToken
    this.timezoneToken = token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
    });

    return this.http.post('/api/fetchUserWithId', data, { headers: headers })
  }

  getTimeZones(data: any) {
    // let userName: any = localStorage.getItem('userName')
    //     userName = userName.replace('mtn.', '')
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': data.autheticationToken,
      'email': 'data'
    });
    return this.http.post('/api/fetchTimezone', data, { headers: headers })
  }

  updateUserWithId(data: any) {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
    });
    return this.http.post('/api/updateUserWithId', data, { headers: headers })
  }

  // forgot password

  sendEmail(data: any) {
    console.log(data, "data");
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
    });
    return this.http.post('/api/forgetpassword', data, { headers: headers })
  }
  updatePassword(data: any) {
    // let userName: any = localStorage.getItem('userName')
    // userName = userName.replace('mtn.', '')
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': "cbedd5a4b977c40e093d009b034988f6978ed0d60e04b2458c",
      'email': 'userName'

    });
    return this.http.post('/api/generatePassword', data, { headers: headers })
  }

  // updatePassword
  updatePasswordUserPassword(data: any) {
    const token: any = localStorage.getItem('token')
    let userName: any = localStorage.getItem('email')
    // userName = userName.replace('mtn.', '')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token,
      'email': userName
    });
    return this.http.post('/api/passwordchange', data, { headers: headers })
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

  //  
  // set profile route
  setProfileRoute(profile: any) {
    this.profileBasedubject.next({ profile })
  }
  getProfileRoute() {
    return this.profileBasedubject.asObservable();
  }
}



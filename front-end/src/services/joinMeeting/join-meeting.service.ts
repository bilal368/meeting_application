import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JoinMeetingService {
  userName: any = localStorage.getItem('email')
  token: string = localStorage.getItem('token') ?? '';

  ngOnInit(): void {
    // this.userName = this.userName.replace('mtn.', '')
    this.userName = localStorage.getItem('email')
  }

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': this.token,
    'email': this.userName
  });

  private displayNameSubject = new BehaviorSubject<{ displayName: any }>({ displayName: '' });

  constructor(private http: HttpClient) { }

  // tenant Name
  setDisplayName(displayName: any) {
    this.displayNameSubject.next({ displayName })
  }

  getDisplayName() {
    return this.displayNameSubject.asObservable();
  }

  checkUserBundleBalance(data: any) {
    console.log(data,"checkUserBundleBalance");
    console.log('Authorization:', this.headers.get('Authorization'), 'Email:', this.headers.get('email'));
    return this.http.post('/api/checkUserBundleBalance', data, { headers: this.headers })
  }

  signature(data: any) {
    this.userName = localStorage.getItem('email');
    const token = 'cbedd5a4b977c40e093d009b034988f6978ed0d60e04b2458c'
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token,
      'email': this.userName
    });
    return this.http.post('/api/signature', data, { headers: headers })
  }

}

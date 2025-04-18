import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MeetinglistService {
  token: any = localStorage.getItem('token');
  userName: any = localStorage.getItem('email')
  private routeBasedubject = new BehaviorSubject<{ route: any }>({ route: '' });
  private updateSubject = new BehaviorSubject<{ notification: any }>({ notification:false });
  ngOnInit(): void {
    this.userName = localStorage.getItem('email')
    // this.userName = this.userName.replace('mtn.', '')
  }
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': this.token,
    'email': this.userName
  });
  constructor(private http: HttpClient) { }



  private refreshPage = new Subject<void>

  get reload() {
    return this.refreshPage
  }

  checkHostbalance(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    })
    return this.http.post('/api/checkHostbalance', data, { headers: this.headers })
  }

  meetingList(data: any) {
    return this.http.post('/api/listMeeting', data, { headers: this.headers })
  }
  getMeetingDetailsByMeetingId(data: any) {
    return this.http.post('/api/mtnGetMeetingWithId', data, { headers: this.headers })
  }
  deleteThisMeeting(data: any) {
    return this.http.post('/api/DeleteReccurence', data, { headers: this.headers }).pipe(
      tap(() => {
        this.reload.next()
      })
    )
  }

  deleteMeeting(data: any) {
    return this.http.post('/api/mtnDeleteMeeting', data, { headers: this.headers }).pipe(
      tap(() => {
        this.reload.next()
      })
    )
  }

  listRecurringMeeting(data: any) {
    return this.http.post('/api/listRecurringMeeting', data, { headers: this.headers })
    // return this.http.post('/api/listRecurringMeeting', data)
  }

  signature(data: any) {
    const token = 'cbedd5a4b977c40e093d009b034988f6978ed0d60e04b2458c'
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token,
      'email': this.userName
    });
    return this.http.post('/api/signature', data, { headers: headers })
  }

  checkUserBundleBalance(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    })
    console.log('Authorization:', this.headers.get('Authorization'), 'Email:', this.headers.get('email'));
    return this.http.post('/api/checkUserBundleBalance', data, { headers: this.headers })
  }

  mtnMeetingHistoryForUser(data: any) {
    return this.http.post('/api/mtnMeetingHistoryForUser', data, { headers: this.headers })
  }
  getTimeZones(data: any) {
    return this.http.post('/api/fetchTimezone', data, { headers: this.headers })
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
  mtnBundlePlanBalance(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    return this.http.post('/api/bundleplan', data, { headers: this.headers })
  }
  mtnPurchaseHistory(data: any) {

    return this.http.post('/api/userplan_history', data, { headers: this.headers })

  }
  copyToClipboard(content: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = content;

    // Make the textarea hidden
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);
    textArea.select();

    try {
      // Attempt to copy the content
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);

      return success;
    } catch (error) {
      // Handle any errors
      console.error('Error copying to clipboard:', error);
      document.body.removeChild(textArea);
      return false;
    }
  }

  // set profile route
  setRoute(route: any) {
    this.routeBasedubject.next({ route })
  }
  getRoute() {
    return this.routeBasedubject.asObservable();
  }
  setUpdateNotification(notification:any) {
    this.updateSubject.next({ notification }) 
   }
   getUpdateNotification() {
    return this.updateSubject.asObservable();
  }


  updateSummary(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    return this.http.post('/api/updateMeetingSummary', data, { headers: this.headers })
  }
  sendSummary(data:any){
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    return this.http.post('/api/sendMail_summaryReport', data, { headers: this.headers })
  }
  deleteSummary(data: any) {
    this.userName = localStorage.getItem('email');
    this.token = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    const options = {
      headers: this.headers,
      body: data  
    };
  
    return this.http.delete('/api/delete-summaryReport', options);
  }


  listMeetings(data: any) {
    this.userName = localStorage.getItem('email')
    this.token = localStorage.getItem('token')
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.token,
      'email': this.userName
    });
    return this.http.post('/api/listMeetings', data, { headers: this.headers })
  }
}

import { Component } from '@angular/core';
import { JoinMeetingService } from 'src/services/joinMeeting/join-meeting.service';

@Component({
  selector: 'app-join-by-url',
  templateUrl: './join-by-url.component.html',
  styleUrls: ['./join-by-url.component.css']
})
export class JoinByUrlComponent {


  constructor(private joinMeeting : JoinMeetingService){}

  setName(name : any){
    console.log(name);
    this.joinMeeting.setDisplayName(name)
  }

}

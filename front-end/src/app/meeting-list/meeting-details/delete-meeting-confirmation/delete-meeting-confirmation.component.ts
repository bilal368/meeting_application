import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupComponent } from 'mtn-sdk/src/app/popup/popup.component';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';

@Component({
  selector: 'app-delete-meeting-confirmation',
  templateUrl: './delete-meeting-confirmation.component.html',
  styleUrls: ['./delete-meeting-confirmation.component.css']
})
export class DeleteMeetingConfirmationComponent {

  id: any = ''
  occurenceId: any
  type: any
  edit: any
  heding:any
  isLoading=false
  constructor(private auth: MeetinglistService, @Inject(MAT_DIALOG_DATA) public datas: any, private popUp: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.id = this.datas.meetingId
    this.occurenceId = this.datas.occurenceId
    this.type = this.datas.type
    this.heding=this.datas.heading
    if (this.type == 2) {
      this.edit = true
    }else{
      this.edit=false
    }
    console.log(this.id);

  }

  deleteConfirmation() {
    this.isLoading=true
    this.auth.deleteMeeting({ meetingId: this.id }).subscribe((res: any) => {
      console.log(res);
      this.isLoading=false
      this.popUp.closeAll()
      this.popUp.open(PopupComponent, { data: { message: res.message } })
    })
  }
  deleteThisOccurence() {
    const data = { meetingId: this.id, occurrence_id: this.occurenceId }
    this.isLoading=true
    console.log(data,"deleteThisOccurence");
    this.auth.deleteThisMeeting(data).subscribe((res: any) => {
      console.log(res, "deleteThisOccurence");
      this.isLoading=false
      this.popUp.closeAll()
      this.popUp.open(PopupComponent, { data: { message: res.message } })
    })
  }

  editThisOccurence() {
    console.log("function call");
    localStorage.setItem('editType','1')
    localStorage.setItem('occurenceId',this.occurenceId)
    this.router.navigateByUrl(`/home/edit-meeting-schedule/ ${this.id} `)
    this.popUp.closeAll()
  }
  editConfirmation() {
    console.log("function call");
    localStorage.setItem('editType','3')
    localStorage.setItem('occurenceId',this.occurenceId)
    this.router.navigateByUrl(`/home/edit-meeting-schedule/ ${this.id} `)
    this.popUp.closeAll()
  }

}

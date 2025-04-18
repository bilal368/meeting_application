import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';

@Component({
  selector: 'app-delete-summary',
  templateUrl: './delete-summary.component.html',
  styleUrls: ['./delete-summary.component.css']
})
export class DeleteSummaryComponent implements OnInit {
  uuid: any

  constructor(@Inject(MAT_DIALOG_DATA) public datas: any,private meetinglistService: MeetinglistService,private snackbar: MatSnackBar,private popUp: MatDialog) { }
  ngOnInit(): void {
    this.uuid = this.datas.uuid
    console.log(this.uuid, "this.uuid");

  }
  deleteSummary() {
    const data = { uuid: this.uuid }
    this.meetinglistService.deleteSummary(data).subscribe((res: any) => {
      console.log(res, "DeleteSummary");
      this.snackbar.open("Summary deleted successfully", 'Dismiss', { duration: 5000 });
      this.popUp.closeAll()
      this.meetinglistService.setUpdateNotification(true)
    })
  }

}

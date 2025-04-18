import { Component, OnInit } from '@angular/core';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';

@Component({
  selector: 'app-plan-details',
  templateUrl: './plan-details.component.html',
  styleUrls: ['./plan-details.component.css']
})
export class PlanDetailsComponent implements OnInit {
  PlanName: any
  ActivePlan = true
  expireDate: any
  userName: any
  loading: any = false
  constructor(private meetinglistService: MeetinglistService) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('email')
    this.mtnBundlePlanBalance()
  }

  mtnBundlePlanBalance() {
    // this.loading=true
    // const data = { email: this.userName }
    // this.meetinglistService.mtnBundlePlanBalance(data).subscribe((res: any) => {
    //   this.loading=false
    //   this.expireDate = res.date      
    //   if (res.plan_name == '') {
    //     this.PlanName = "Meetings⁺"
    //   } else {
    //     const planNameSuffix = res.plan_name;
    //     this.PlanName = `Meetings⁺ ${planNameSuffix}`;
    //   }
    // }, err => {
    //   if (err.status = "402") {
    //     this.loading=false
    //     this.ActivePlan = false
    //     this.PlanName = "No Active Plan"
    //   }
    // })
    const storedPlanDetails = localStorage.getItem('plandetails');
    if (storedPlanDetails) {
      // Parse the JSON string back into an object
      const planDetails = JSON.parse(storedPlanDetails);
      // Use the retrieved plan details
      this.PlanName = planDetails.planName;
      this.expireDate = planDetails.expireDate;
      console.log('Retrieved Plan Details:', planDetails);
      if (this.PlanName == "No Active Plan") {
        this.loading = false
        this.ActivePlan = false
        this.PlanName = "No Active Plan"
      }
    } else {
      this.PlanName = "No Active Plan"
    }
  }

}

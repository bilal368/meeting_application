import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MeetinglistService } from 'src/services/meetinglist/meetinglist.service';

@Component({
  selector: 'app-purchase-history',
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.css']
})
export class PurchaseHistoryComponent implements OnInit {
  noData: boolean = false
  phoneNumber: any
  timeZone: any
  email:any
  purchaseHistory: any = []
  convertedPurchaseHistory: any
  constructor(private router: Router, private service: MeetinglistService) { }
  ngOnInit(): void {
    this.getFromlocalstorage()
    this.getPurchaseHistory()
    // this.dateConvertion()
  }



  route() {
    this.router.navigateByUrl('/home/meeting-list')
  }
  getPurchaseHistory() {
    const data = { limit: "50", timezone: this.timeZone, phone: this.phoneNumber,email:this.email 
    }
    this.service.mtnPurchaseHistory(data).subscribe((res: any) => {
      console.log(res, "getPurchaseHistory");
      this.purchaseHistory = res.Bundleplans
      this.dateConvertion(res.Bundleplans)
      if (this.purchaseHistory.length <= 0) {
        this.noData = true
      } else {
        this.noData = false
      }
    })
  }

  getFromlocalstorage() {
    this.timeZone = localStorage.getItem('timeZone')
    this.phoneNumber = localStorage.getItem('phoneNumber')
    this.email== localStorage.getItem('email')
  }
  convertToTimeZone(dateString: any) {
    if (typeof dateString === 'string' || dateString instanceof String) {
      const formattedDate = dateString.replace('T', ' ').replace('Z', '');
      return formattedDate;
    } else {
      return dateString;
    }
  }


  dateConvertion(data: any) {
    console.log(data, "function");
    this.convertedPurchaseHistory = data.map((item: any) => {
      return {
        ...item,
        bundleExpiryDateAndTIme: this.convertToTimeZone(item.bundleExpiryDateAndTIme),
        bundlePurchaseDate: this.convertToTimeZone(item.bundlePurchaseDate),
        bundleStartDate: this.convertToTimeZone(item.bundleStartDate)
      };
    });
    console.log(this.convertedPurchaseHistory, "converted date data");
  }

}

import { Component,Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  [x: string]: any;

  constructor(@Inject(MAT_DIALOG_DATA) public datas: any) { }

  message: any = ''
  heading: any = ''

  ngOnInit() {
    console.log(this.datas);
    this.heading = this.datas.heading
    this.message = this.datas.message
  }

}

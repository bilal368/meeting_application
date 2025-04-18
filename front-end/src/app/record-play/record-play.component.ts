import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-record-play',
  templateUrl: './record-play.component.html',
  styleUrls: ['./record-play.component.css']
})
export class RecordPlayComponent implements OnInit {
  url:any
  constructor(private route: ActivatedRoute,private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const rawUrl = params['url']; // Assuming the parameter is named 'url'
      const fullUrl = 'https://us06web.zoom.us/rec/play/' + rawUrl; // Concatenating the base URL with the raw URL
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);    });
      console.log(this.url);
      
  }
}

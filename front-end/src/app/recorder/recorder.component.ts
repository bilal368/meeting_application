import { Component, HostListener, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.css']
})
export class RecorderComponent {
  @ViewChild('header') headerElement: ElementRef | undefined;
  @ViewChild('iframe') iframeElement: ElementRef | undefined;
  @ViewChild('zoomIframe') zoomIframe: any;

  constructor(private elRef: ElementRef) {}

  @HostListener('window:resize')
  onResize() {
    this.setIframeHeight();
  }

  ngAfterViewInit() {
    this.setIframeHeight();
  }

  private setIframeHeight() {
    if (this.headerElement && this.headerElement.nativeElement && this.iframeElement && this.iframeElement.nativeElement) {
      const headerHeight = this.headerElement.nativeElement.offsetHeight;
      const windowHeight = window.innerHeight;
      this.iframeElement.nativeElement.style.height = (windowHeight - headerHeight) + 'px';
    }
  }
  
}

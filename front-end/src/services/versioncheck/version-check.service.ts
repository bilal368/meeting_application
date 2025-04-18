import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class VersionCheckService {
  private currentVersion = '1.0.3'; // set your app's initial version here

  constructor(private http: HttpClient) { }
  initVersionCheck(url: string) {
    this.http.get<{ version: string }>(url)
      .subscribe(data => {
        console.log(data.version,"data.version");
        if (data.version !== this.currentVersion) {
          this.promptUser();
        }
      });
    interval(1000 * 60 * 2).pipe( // check every 2 minutes
      switchMap(() => this.http.get<{ version: string }>(url))
    ).subscribe(data => {
      if (data.version !== this.currentVersion) {
        this.promptUser();
      }
    })
  }
  private promptUser() {
    if (confirm('A new version of the application is available. Load new version?')) {
      // window.location.reload();
      const cacheBuster = `?t=${new Date().getTime()}`;
      // Perform a hard reload by replacing the current URL with a cache-busting parameter
      window.location.replace(window.location.href + cacheBuster);

    }
}
}


import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { NewMeetingComponent } from './new-meeting/new-meeting.component';
import { JoinMeetingComponent } from './join-meeting/join-meeting.component';
import { ScheduleMeetingComponent } from './schedule-meeting/schedule-meeting.component';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MeetingDetailsComponent } from './meeting-list/meeting-details/meeting-details.component';
import { EditScheduleMeetingComponent } from './schedule-meeting/edit-schedule-meeting/edit-schedule-meeting.component';
import { UsageHistoryComponent } from './usage-history/usage-history.component';
import { HttpClientModule } from '@angular/common/http';
import { PopupComponent } from './shared/popup/popup.component';
import { GeneratePasswordComponent } from './generate-password/generate-password.component';
import { DeleteMeetingConfirmationComponent } from './meeting-list/meeting-details/delete-meeting-confirmation/delete-meeting-confirmation.component';
import { DatePipe } from '@angular/common';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { SendEmailComponent } from './login/send-email/send-email.component';
import { TitleService } from 'src/services/title.service';
import { JoinByUrlComponent } from './join-by-url/join-by-url.component';
import { LaunchMeetingComponent } from './launch-meeting/launch-meeting.component';
import { UpdatePasswordComponent } from './updatePassword/update-password/update-password.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { PasswordRetryComponent } from './login/password-retry/password-retry.component';
import { MaintananceComponent } from './maintanance/maintanance.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { MeetingSuccessfullPopUpComponent } from './shared/popup/meeting-successfull-pop-up/meeting-successfull-pop-up.component';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { LogoutPopupComponent } from './home/logout-popup/logout-popup.component';
import { SupportComponent } from './support/support.component';
import { PlanDetailsComponent } from './plan-details/plan-details.component';
import { LaunchAppComponent } from './launch-meeting/launch-app/launch-app.component';
import { RecordPlayComponent } from './record-play/record-play.component';
import { ViewSummaryDetailsComponent } from './usage-history/view-summary-details/view-summary-details.component';
import { MatChipsModule } from '@angular/material/chips';
import { DeleteSummaryComponent } from './usage-history/view-summary-details/delete-summary/delete-summary.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    HomeComponent,
    NewMeetingComponent,
    JoinMeetingComponent,
    ScheduleMeetingComponent,
    MeetingListComponent,
    MeetingDetailsComponent,
    EditScheduleMeetingComponent,
    UsageHistoryComponent,
    PopupComponent,
    GeneratePasswordComponent,
    DeleteMeetingConfirmationComponent,
    ResetPasswordComponent,
    SendEmailComponent,
    JoinByUrlComponent,
    LaunchMeetingComponent,
    UpdatePasswordComponent,
    LoadingSpinnerComponent,
    PasswordRetryComponent,
    MaintananceComponent,
    PurchaseHistoryComponent,
    MeetingSuccessfullPopUpComponent,
    ProfileComponent,
    LogoutPopupComponent,
    SupportComponent,
    PlanDetailsComponent,
    LaunchAppComponent,
    RecordPlayComponent,
    ViewSummaryDetailsComponent,
    DeleteSummaryComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, AppRoutingModule, MatButtonModule,
    MatToolbarModule, MatSlideToggleModule, BrowserAnimationsModule,
    ReactiveFormsModule, MatDialogModule, MatIconModule, MatTooltipModule,
    MatFormFieldModule, MatSelectModule, MatTabsModule, MatSnackBarModule, MatMenuModule, MatInputModule, FormsModule,MatChipsModule
  ],
  providers: [DatePipe, TitleService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private titleService: TitleService) {
    this.titleService.initialize();
  }
}

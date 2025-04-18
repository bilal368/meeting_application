import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NewMeetingComponent } from './new-meeting/new-meeting.component';
import { JoinMeetingComponent } from './join-meeting/join-meeting.component';
import { ScheduleMeetingComponent } from './schedule-meeting/schedule-meeting.component';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { EditScheduleMeetingComponent } from './schedule-meeting/edit-schedule-meeting/edit-schedule-meeting.component';
import { UsageHistoryComponent } from './usage-history/usage-history.component';
import { AuthGuard } from 'src/services/authguard/authguard.guard';
import { GeneratePasswordComponent } from './generate-password/generate-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { SendEmailComponent } from './login/send-email/send-email.component';
import { LaunchMeetingComponent } from './launch-meeting/launch-meeting.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdatePasswordComponent } from './updatePassword/update-password/update-password.component';
import { SupportComponent } from './support/support.component';
import { RecordPlayComponent } from './record-play/record-play.component';

const routes: Routes = [
  { path: '', component: LoginComponent, data: { title: 'Meetings⁺ Sign-in' } },
  { path: 'login', component: LoginComponent, data: { title: 'Meetings⁺ Sign-in' } },
  { path: 'resetPassword/:token', component: ResetPasswordComponent, data: { title: 'Meetings⁺ ResetPassword' } },
  { path: 'getResetForm', component: SendEmailComponent, data: { title: 'Meetings⁺ Verification' } },
  { path: 'launchMeeting', component: LaunchMeetingComponent, data: { title: 'Meetings⁺ Launch Meeting' } },
  { path: 'play/:url', component: RecordPlayComponent, data: { title: 'Meetings⁺ Record Play' } },

  {
    path: 'home', component: HomeComponent, canActivate: [AuthGuard], children: [
      { path: 'newMeeting', component: NewMeetingComponent, data: { title: 'Meetings⁺ new Meeting' } },
      { path: 'joinMeeting', component: JoinMeetingComponent, data: { title: 'Meetings⁺ join Meeting' } },
      { path: 'schedule', component: ScheduleMeetingComponent, data: { title: 'Meetings⁺ Schedule' } },
      { path: 'meeting-list', component: MeetingListComponent, data: { title: 'Meetings⁺ Home' } },
      { path: 'edit-meeting-schedule/:meetingId', component: EditScheduleMeetingComponent, data: { title: 'Meetings⁺ Edit Meeting' } },
      { path: 'usage-history', component: UsageHistoryComponent},
      { path: 'purchase-history', component: PurchaseHistoryComponent, data: { title: 'Meetings⁺ Purchase History' } },
      { path: 'update-password', component: UpdatePasswordComponent, data: { title: 'Meetings⁺ Update Password' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'Meetings⁺ Profile' } },
      { path: 'contactSupport', component: SupportComponent, data: { title: 'Meetings⁺ Contact support' } }

    ]
  },
  { path: "generatePassword/:token", component: GeneratePasswordComponent, data: { title: 'Meetings⁺ GeneratePassword' } },
  { path: 'l', component: LoginComponent, data: { title: 'Meetings⁺ Login' } },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinMeetingComponent } from './join-meeting.component';

describe('JoinMeetingComponent', () => {
  let component: JoinMeetingComponent;
  let fixture: ComponentFixture<JoinMeetingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinMeetingComponent]
    });
    fixture = TestBed.createComponent(JoinMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

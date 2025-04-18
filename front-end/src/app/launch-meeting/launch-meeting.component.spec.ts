import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchMeetingComponent } from './launch-meeting.component';

describe('LaunchMeetingComponent', () => {
  let component: LaunchMeetingComponent;
  let fixture: ComponentFixture<LaunchMeetingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LaunchMeetingComponent]
    });
    fixture = TestBed.createComponent(LaunchMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

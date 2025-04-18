import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMeetingComponent } from './new-meeting.component';

describe('NewMeetingComponent', () => {
  let component: NewMeetingComponent;
  let fixture: ComponentFixture<NewMeetingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewMeetingComponent]
    });
    fixture = TestBed.createComponent(NewMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

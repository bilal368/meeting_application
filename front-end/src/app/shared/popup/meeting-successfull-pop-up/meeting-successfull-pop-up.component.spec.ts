import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingSuccessfullPopUpComponent } from './meeting-successfull-pop-up.component';

describe('MeetingSuccessfullPopUpComponent', () => {
  let component: MeetingSuccessfullPopUpComponent;
  let fixture: ComponentFixture<MeetingSuccessfullPopUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingSuccessfullPopUpComponent]
    });
    fixture = TestBed.createComponent(MeetingSuccessfullPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

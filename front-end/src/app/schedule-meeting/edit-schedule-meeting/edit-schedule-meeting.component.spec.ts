import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditScheduleMeetingComponent } from './edit-schedule-meeting.component';

describe('EditScheduleMeetingComponent', () => {
  let component: EditScheduleMeetingComponent;
  let fixture: ComponentFixture<EditScheduleMeetingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditScheduleMeetingComponent]
    });
    fixture = TestBed.createComponent(EditScheduleMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMeetingConfirmationComponent } from './delete-meeting-confirmation.component';

describe('DeleteMeetingConfirmationComponent', () => {
  let component: DeleteMeetingConfirmationComponent;
  let fixture: ComponentFixture<DeleteMeetingConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteMeetingConfirmationComponent]
    });
    fixture = TestBed.createComponent(DeleteMeetingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

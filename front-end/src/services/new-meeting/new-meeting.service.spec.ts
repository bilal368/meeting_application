import { TestBed } from '@angular/core/testing';

import { NewMeetingService } from './new-meeting.service';

describe('NewMeetingService', () => {
  let service: NewMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

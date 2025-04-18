import { TestBed } from '@angular/core/testing';

import { MeetinglistService } from './meetinglist.service';

describe('MeetinglistService', () => {
  let service: MeetinglistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeetinglistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordPlayComponent } from './record-play.component';

describe('RecordPlayComponent', () => {
  let component: RecordPlayComponent;
  let fixture: ComponentFixture<RecordPlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecordPlayComponent]
    });
    fixture = TestBed.createComponent(RecordPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

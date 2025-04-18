import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSummaryDetailsComponent } from './view-summary-details.component';

describe('ViewSummaryDetailsComponent', () => {
  let component: ViewSummaryDetailsComponent;
  let fixture: ComponentFixture<ViewSummaryDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSummaryDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewSummaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

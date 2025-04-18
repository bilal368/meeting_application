import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSummaryComponent } from './delete-summary.component';

describe('DeleteSummaryComponent', () => {
  let component: DeleteSummaryComponent;
  let fixture: ComponentFixture<DeleteSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteSummaryComponent]
    });
    fixture = TestBed.createComponent(DeleteSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageHistoryComponent } from './usage-history.component';

describe('UsageHistoryComponent', () => {
  let component: UsageHistoryComponent;
  let fixture: ComponentFixture<UsageHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsageHistoryComponent]
    });
    fixture = TestBed.createComponent(UsageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

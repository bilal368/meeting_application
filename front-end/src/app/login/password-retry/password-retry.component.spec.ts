import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRetryComponent } from './password-retry.component';

describe('PasswordRetryComponent', () => {
  let component: PasswordRetryComponent;
  let fixture: ComponentFixture<PasswordRetryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordRetryComponent]
    });
    fixture = TestBed.createComponent(PasswordRetryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchAppComponent } from './launch-app.component';

describe('LaunchAppComponent', () => {
  let component: LaunchAppComponent;
  let fixture: ComponentFixture<LaunchAppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LaunchAppComponent]
    });
    fixture = TestBed.createComponent(LaunchAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

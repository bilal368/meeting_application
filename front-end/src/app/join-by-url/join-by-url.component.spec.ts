import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinByUrlComponent } from './join-by-url.component';

describe('JoinByUrlComponent', () => {
  let component: JoinByUrlComponent;
  let fixture: ComponentFixture<JoinByUrlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinByUrlComponent]
    });
    fixture = TestBed.createComponent(JoinByUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyTaskComponent } from './verify-task.component';

describe('VerifyTaskComponent', () => {
  let component: VerifyTaskComponent;
  let fixture: ComponentFixture<VerifyTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

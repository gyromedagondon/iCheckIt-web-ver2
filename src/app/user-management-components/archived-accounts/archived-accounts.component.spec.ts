import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedAccountsComponent } from './archived-accounts.component';

describe('ArchivedAccountsComponent', () => {
  let component: ArchivedAccountsComponent;
  let fixture: ComponentFixture<ArchivedAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchivedAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

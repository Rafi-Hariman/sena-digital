import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MempelaiComponent } from './mempelai.component';

describe('MempelaiComponent', () => {
  let component: MempelaiComponent;
  let fixture: ComponentFixture<MempelaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MempelaiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MempelaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

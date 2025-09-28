import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRegistrasiComponent } from './data-registrasi.component';

describe('DataRegistrasiComponent', () => {
  let component: DataRegistrasiComponent;
  let fixture: ComponentFixture<DataRegistrasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataRegistrasiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataRegistrasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

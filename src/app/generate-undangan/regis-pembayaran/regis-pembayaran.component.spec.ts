import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisPembayaranComponent } from './regis-pembayaran.component';

describe('RegisPembayaranComponent', () => {
  let component: RegisPembayaranComponent;
  let fixture: ComponentFixture<RegisPembayaranComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisPembayaranComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisPembayaranComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

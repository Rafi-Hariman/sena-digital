import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PengunjungComponent } from './pengunjung.component';

describe('PengunjungComponent', () => {
  let component: PengunjungComponent;
  let fixture: ComponentFixture<PengunjungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PengunjungComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PengunjungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

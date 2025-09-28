import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformasiMempelaiComponent } from './informasi-mempelai.component';

describe('InformasiMempelaiComponent', () => {
  let component: InformasiMempelaiComponent;
  let fixture: ComponentFixture<InformasiMempelaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformasiMempelaiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformasiMempelaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

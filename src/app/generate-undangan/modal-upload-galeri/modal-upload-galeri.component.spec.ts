import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUploadGaleriComponent } from './modal-upload-galeri.component';

describe('ModalUploadGaleriComponent', () => {
  let component: ModalUploadGaleriComponent;
  let fixture: ComponentFixture<ModalUploadGaleriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUploadGaleriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUploadGaleriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

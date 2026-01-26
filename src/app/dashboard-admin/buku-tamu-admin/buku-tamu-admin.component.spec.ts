import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BukuTamuAdminComponent } from './buku-tamu-admin.component';

describe('BukuTamuAdminComponent', () => {
  let component: BukuTamuAdminComponent;
  let fixture: ComponentFixture<BukuTamuAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BukuTamuAdminComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BukuTamuAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

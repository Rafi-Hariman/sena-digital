import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BukuTamuViewComponent } from './buku-tamu-view.component';

describe('BukuTamuViewComponent', () => {
  let component: BukuTamuViewComponent;
  let fixture: ComponentFixture<BukuTamuViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BukuTamuViewComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BukuTamuViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TampilanComponent } from './tampilan.component';

describe('TampilanComponent', () => {
  let component: TampilanComponent;
  let fixture: ComponentFixture<TampilanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TampilanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TampilanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

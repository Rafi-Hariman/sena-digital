import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateUndanganComponent } from './generate-undangan.component';

describe('GenerateUndanganComponent', () => {
  let component: GenerateUndanganComponent;
  let fixture: ComponentFixture<GenerateUndanganComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateUndanganComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateUndanganComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

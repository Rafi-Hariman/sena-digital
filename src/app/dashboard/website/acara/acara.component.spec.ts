import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcaraComponent } from './acara.component';

describe('AcaraComponent', () => {
  let component: AcaraComponent;
  let fixture: ComponentFixture<AcaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcaraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisCeritaComponent } from './regis-cerita.component';

describe('RegisCeritaComponent', () => {
  let component: RegisCeritaComponent;
  let fixture: ComponentFixture<RegisCeritaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisCeritaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisCeritaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

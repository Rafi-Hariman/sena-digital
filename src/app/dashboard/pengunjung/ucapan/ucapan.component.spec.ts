import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcapanComponent } from './ucapan.component';

describe('UcapanComponent', () => {
  let component: UcapanComponent;
  let fixture: ComponentFixture<UcapanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UcapanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UcapanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

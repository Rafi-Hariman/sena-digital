import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAplicationComponent } from './settings-aplication.component';

describe('SettingsAplicationComponent', () => {
  let component: SettingsAplicationComponent;
  let fixture: ComponentFixture<SettingsAplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsAplicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

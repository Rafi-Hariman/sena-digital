import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBundleComponent } from './settings-bundle.component';

describe('SettingsBundleComponent', () => {
  let component: SettingsBundleComponent;
  let fixture: ComponentFixture<SettingsBundleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsBundleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

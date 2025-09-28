import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubungiKamiComponent } from './hubungi-kami.component';

describe('HubungiKamiComponent', () => {
  let component: HubungiKamiComponent;
  let fixture: ComponentFixture<HubungiKamiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HubungiKamiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HubungiKamiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

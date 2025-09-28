import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataWebsiteComponent } from './data-website.component';

describe('DataWebsiteComponent', () => {
  let component: DataWebsiteComponent;
  let fixture: ComponentFixture<DataWebsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataWebsiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataWebsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

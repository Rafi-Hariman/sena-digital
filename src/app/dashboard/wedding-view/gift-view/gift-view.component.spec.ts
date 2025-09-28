/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GiftViewComponent } from './gift-view.component';

describe('GiftViewComponent', () => {
  let component: GiftViewComponent;
  let fixture: ComponentFixture<GiftViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GiftViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

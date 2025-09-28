/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoupleViewComponent } from './couple-view.component';

describe('CoupleViewComponent', () => {
  let component: CoupleViewComponent;
  let fixture: ComponentFixture<CoupleViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoupleViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoupleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

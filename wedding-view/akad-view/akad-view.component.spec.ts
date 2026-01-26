/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AkadViewComponent } from './akad-view.component';

describe('AkadViewComponent', () => {
  let component: AkadViewComponent;
  let fixture: ComponentFixture<AkadViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AkadViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AkadViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

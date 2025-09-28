import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeritaQuoteComponent } from './cerita-quote.component';

describe('CeritaQuoteComponent', () => {
  let component: CeritaQuoteComponent;
  let fixture: ComponentFixture<CeritaQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CeritaQuoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CeritaQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermAndConditionPage } from './term-and-condition-page';

describe('TermAndConditionPage', () => {
  let component: TermAndConditionPage;
  let fixture: ComponentFixture<TermAndConditionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermAndConditionPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermAndConditionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

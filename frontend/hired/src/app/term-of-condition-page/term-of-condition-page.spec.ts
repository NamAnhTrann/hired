import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermOfConditionPage } from './term-of-condition-page';

describe('TermOfConditionPage', () => {
  let component: TermOfConditionPage;
  let fixture: ComponentFixture<TermOfConditionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermOfConditionPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermOfConditionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

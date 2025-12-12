import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreCheckoutPage } from './pre-checkout-page';

describe('PreCheckoutPage', () => {
  let component: PreCheckoutPage;
  let fixture: ComponentFixture<PreCheckoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreCheckoutPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreCheckoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

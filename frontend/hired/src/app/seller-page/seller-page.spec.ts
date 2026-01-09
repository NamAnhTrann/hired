import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerPage } from './seller-page';

describe('SellerPage', () => {
  let component: SellerPage;
  let fixture: ComponentFixture<SellerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

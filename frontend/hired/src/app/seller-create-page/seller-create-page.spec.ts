import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerCreatePage } from './seller-create-page';

describe('SellerCreatePage', () => {
  let component: SellerCreatePage;
  let fixture: ComponentFixture<SellerCreatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerCreatePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

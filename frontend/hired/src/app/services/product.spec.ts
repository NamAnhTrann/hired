import { TestBed } from '@angular/core/testing';

import { Product_Service } from './product';

describe('Product', () => {
  let service: Product_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Product_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

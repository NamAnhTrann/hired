import { TestBed } from '@angular/core/testing';

import { Seller_Service } from './seller';

describe('Seller', () => {
  let service: Seller_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Seller_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

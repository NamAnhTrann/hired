import { TestBed } from '@angular/core/testing';

import { Cart_Service } from './cart';

describe('Cart', () => {
  let service: Cart_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cart_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

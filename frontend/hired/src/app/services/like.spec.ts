import { TestBed } from '@angular/core/testing';

import { Like_Service } from './like';

describe('Like', () => {
  let service: Like_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Like_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

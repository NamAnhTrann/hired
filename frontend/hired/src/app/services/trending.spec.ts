import { TestBed } from '@angular/core/testing';

import { Trending_Service } from './trending';

describe('Trending', () => {
  let service: Trending_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Trending_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

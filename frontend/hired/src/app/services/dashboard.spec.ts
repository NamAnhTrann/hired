import { TestBed } from '@angular/core/testing';

import { Dashboard_Service } from './dashboard';

describe('Dashboard', () => {
  let service: Dashboard_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dashboard_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

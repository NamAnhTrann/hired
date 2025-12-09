import { TestBed } from '@angular/core/testing';

import { Contact_Service } from './contact';

describe('Contact', () => {
  let service: Contact_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Contact_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

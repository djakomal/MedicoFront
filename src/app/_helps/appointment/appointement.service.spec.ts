import { TestBed } from '@angular/core/testing';

import { AppointementService } from './appointement.service';

describe('AppointementService', () => {
  let service: AppointementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

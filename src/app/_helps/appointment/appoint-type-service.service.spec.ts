import { TestBed } from '@angular/core/testing';

import { AppointTypeServiceService } from './appoint-type-service.service';

describe('AppointTypeServiceService', () => {
  let service: AppointTypeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointTypeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

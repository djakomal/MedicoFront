import { TestBed } from '@angular/core/testing';

import { ZoomServiceService } from './zoom-service.service';

describe('ZoomServiceService', () => {
  let service: ZoomServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoomServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

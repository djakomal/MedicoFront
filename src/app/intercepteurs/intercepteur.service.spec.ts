import { TestBed } from '@angular/core/testing';

import { IntercepteurService } from './intercepteur.service';

describe('IntercepteurService', () => {
  let service: IntercepteurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntercepteurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

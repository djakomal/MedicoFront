import { TestBed } from '@angular/core/testing';

import { DocteurService } from './docteur.service';

describe('DocteurService', () => {
  let service: DocteurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocteurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

  import { TestBed } from '@angular/core/testing';

import { AppointementInsertService } from './appointement-insert.service';

describe('AppointementInsertService', () => {
  let service: AppointementInsertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointementInsertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

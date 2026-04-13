import { ZoomSimpleService } from './ZoomSimpleService';
import { TestBed } from '@angular/core/testing';


describe('ZoomSimpleService', () => {
  let service: ZoomSimpleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoomSimpleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});

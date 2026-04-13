import { TestBed } from '@angular/core/testing';
import { Creneau } from '../../models/Creneau';



describe('Creneau', () => {
  let service: Creneau;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Creneau);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});

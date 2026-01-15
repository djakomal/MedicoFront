import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetActualiteComponent } from './get-actualite.component';

describe('GetActualiteComponent', () => {
  let component: GetActualiteComponent;
  let fixture: ComponentFixture<GetActualiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetActualiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetActualiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

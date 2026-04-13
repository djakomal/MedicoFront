import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateActualiteComponent } from './update-actualite.component';

describe('UpdateActualiteComponent', () => {
  let component: UpdateActualiteComponent;
  let fixture: ComponentFixture<UpdateActualiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateActualiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateActualiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetConseilsComponent } from './get-conseils.component';

describe('GetConseilsComponent', () => {
  let component: GetConseilsComponent;
  let fixture: ComponentFixture<GetConseilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetConseilsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetConseilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

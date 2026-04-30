import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateConseilsComponent } from './update-conseils.component';

describe('UpdateConseilsComponent', () => {
  let component: UpdateConseilsComponent;
  let fixture: ComponentFixture<UpdateConseilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateConseilsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateConseilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteDetComponent } from './registe-det.component';

describe('RegisteDetComponent', () => {
  let component: RegisteDetComponent;
  let fixture: ComponentFixture<RegisteDetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisteDetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisteDetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

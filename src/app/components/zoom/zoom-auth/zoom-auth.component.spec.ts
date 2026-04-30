import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomAuthComponent } from './zoom-auth.component';

describe('ZoomAuthComponent', () => {
  let component: ZoomAuthComponent;
  let fixture: ComponentFixture<ZoomAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoomAuthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ZoomAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

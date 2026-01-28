import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingCreateComponent } from './meeting-create.component';

describe('MeetingCreateComponent', () => {
  let component: MeetingCreateComponent;
  let fixture: ComponentFixture<MeetingCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeetingCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

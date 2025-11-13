import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteConfirmationComponent } from './note-confirmation.component';

describe('NoteConfirmationComponent', () => {
  let component: NoteConfirmationComponent;
  let fixture: ComponentFixture<NoteConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteConfirmationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

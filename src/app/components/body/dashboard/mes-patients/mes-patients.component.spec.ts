import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesPatientsComponent } from './mes-patients.component';

describe('MesPatientsComponent', () => {
  let component: MesPatientsComponent;
  let fixture: ComponentFixture<MesPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesPatientsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MesPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesExperiencesComponent } from './mes-experiences.component';

describe('MesExperiencesComponent', () => {
  let component: MesExperiencesComponent;
  let fixture: ComponentFixture<MesExperiencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesExperiencesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MesExperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

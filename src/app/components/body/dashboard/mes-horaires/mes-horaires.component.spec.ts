import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesHorairesComponent } from './mes-horaires.component';

describe('MesHorairesComponent', () => {
  let component: MesHorairesComponent;
  let fixture: ComponentFixture<MesHorairesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesHorairesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MesHorairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

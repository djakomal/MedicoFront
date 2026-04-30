import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesConseilsComponent } from './mes-conseils.component';

describe('MesConseilsComponent', () => {
  let component: MesConseilsComponent;
  let fixture: ComponentFixture<MesConseilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesConseilsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MesConseilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesFormationsComponent } from './mes-formations.component';

describe('MesFormationsComponent', () => {
  let component: MesFormationsComponent;
  let fixture: ComponentFixture<MesFormationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesFormationsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MesFormationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

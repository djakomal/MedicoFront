import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypesConsultationsComponent } from './types-consultations.component';

describe('TypesConsultationsComponent', () => {
  let component: TypesConsultationsComponent;
  let fixture: ComponentFixture<TypesConsultationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypesConsultationsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TypesConsultationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

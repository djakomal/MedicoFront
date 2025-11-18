import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguesParleesComponent } from './langues-parlees.component';

describe('LanguesParleesComponent', () => {
  let component: LanguesParleesComponent;
  let fixture: ComponentFixture<LanguesParleesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguesParleesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguesParleesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointementService } from './appointement.service';
import { Appoitement } from '../../models/appoitement';

describe('AppointementService', () => {
  let service: AppointementService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/medico/appointment';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointementService]
    });
    service = TestBed.inject(AppointementService);
    httpMock = TestBed.inject(HttpTestingController);
    // Set a dummy token in localStorage for header generation
    localStorage.setItem('token', 'dummy-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('should POST addAppoitement with Authorization header', () => {
    const payload: Appoitement = { id: 1 } as any;
    service.addAppoitement(payload).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/add`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload });
  });

  it('should GET getAllAppointment with headers', () => {
    service.getAllAppointment().subscribe();

    const req = httpMock.expectOne(`${baseUrl}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    req.flush([]);
  });

  it('should GET getAppById with the provided id and headers', () => {
    const id = 42;
    service.getAppById(id).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/get/${id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    req.flush({ id } as any);
  });

  it('should DELETE deleteAppointment with headers', () => {
    const id = 9;
    service.deleteAppointment(id).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/delete/${id}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    req.flush({});
  });

  it('should GET today appointments with headers', () => {
    service.getTodayAppointments().subscribe();

    const req = httpMock.expectOne(`${baseUrl}/today`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    req.flush([]);
  });

  it('should GET appointments by doctor with headers', () => {
    const doctorId = 3;
    service.getAppointmentsByDoctor(doctorId).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/doctor/${doctorId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    req.flush([]);
  });

  it('should GET appointments by patient with headers', () => {
    const patientId = 7;
    service.getAppointmentsByPatient(patientId).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/patient/${patientId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    req.flush([]);
  });

  it('should PUT updateAppointment with body and headers', () => {
    const id = 11;
    const payload: Appoitement = { id } as any;
    service.updateAppointment(id, payload).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/update/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Bearer dummy-token');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload });
  });

  it('should include empty Bearer token if token missing', () => {
    localStorage.removeItem('token');

    service.getAllAppointment().subscribe();
    const req = httpMock.expectOne(`${baseUrl}`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer null');
    req.flush([]);
  });
});

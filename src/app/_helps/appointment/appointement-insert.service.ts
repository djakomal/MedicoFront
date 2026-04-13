import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AppointementInsertService {

  constructor(
    private fb: FormBuilder
  ) { }

  public appointementInsertCreate() {
    return this.fb.group({
        name: '',
        email: '',
        date: '',
        time: '',
        description: ''

    });
  }
}

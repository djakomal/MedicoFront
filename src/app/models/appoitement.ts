import { Time } from "@angular/common";
import { Injectable } from "@angular/core";



@Injectable({
    providedIn: 'root'
  })

export class Appoitement {

  id!: number;
  name!: string;
  email!: string;
  date!: string;
  time!: string;
  statut!: string;
  description!: string;
  regtime?: string;

  // constructor(emails:string, dates :Date ,times :Time, descriptions:string, regimes:string){
  //   this._name =names;
  //   this._email=emails;
  //   this._date=dates;
  //   this._time=times;

}

import { Time } from "@angular/common";
import { Injectable } from "@angular/core";



@Injectable({
    providedIn: 'root'
  })

export class AppoitementType {

  id!: number;
  name!: string;
  type!:string;
  date!: string;
  description!: string;
  statut!: string;
 

  // constructor(emails:string, dates :Date ,times :Time, descriptions:string, regimes:string){
  //   this._name =names;
  //   this._email=emails;
  //   this._date=dates;
  //   this._time=times;

}

import { Injectable } from "@angular/core";
import { Role } from "./role";
@Injectable({
    providedIn: 'root'
  })

export class User {
    id!: number;
    username!: string;
    email!: string;
    password!: string;
    confirmPassword!:string;
    firstName!: string;
    lastName!: string;
    role!:string;
    gender!: string; 
}

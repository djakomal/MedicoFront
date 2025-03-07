import { Injectable } from "@angular/core";
import { Role } from "./role";
@Injectable({
    providedIn: 'root'
  })

export class User {

    // role= [{ id: 1, name: 'ROLE_USER' }];
    id!: number;
    username!: string;
    email!: string;
    password!: string;
    firstName!: string;
    lastName!: string;
    role!:string;
    gender!: string; 
}

import { Time } from "@angular/common";
import { Injectable } from "@angular/core";
import { Docteur } from "./docteur";
import { Speciality } from "./speciality";
import { Creneau } from "./Creneau";



@Injectable({
    providedIn: 'root'
  })

export class Appoitement {
  id!: number; 
  patientId!: number;
   patient?: {  
    id: number;
  };
  firstname!: string;
  lastname!: string;
  birthdate!: string; 
  gender!: 'male' | 'female' | 'other';
  email!: string;
  phone!: string;
  insurance!: string; // Optionnel
  speciality!: Speciality.GENERAL; // Spécialité médicale du rendez-vous
  zoomLink?: string;        // alias legacy
  zoomStartUrl?: string;   
  zoomJoinUrl?: string; // lien hôte (start_url)
  zoomPassword?: string;    
  // Détails du rendez-vous (Étape 2)
  doctorType!: string;
  otherSpecialist!: string; 
  doctorId!:number;
  doctor?:Docteur;
  creneauId!: number; 
  creneau?: Creneau;
  docteur?: number;  
  appointmentType!: string;
  preferredDate!: string; 
  preferredTime!: string;
  meetingUrl!:string;
  zoomMeetingId!:string;
  duration!:number;
  // Disponibilités alternatives
   altAvailability!: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  
  // Informations médicales
  reason!: string;
  symptoms!: string;
  firstVisit!: 'yes' | 'no';
  allergies!: string;
  medications!: string;
  
  // Informations complémentaires
  additionalInfo!: string; 
  consent!: boolean;

  
  // Champs potentiellement ajoutés par le backend
  status!: 'pending' | 'started' | 'rejected'| 'validated'|'completed';
  createdAt!: string;
  updatedAt!: string;

}

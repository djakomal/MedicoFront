import { Time } from "@angular/common";
import { Injectable } from "@angular/core";
import { Docteur } from "./docteur";



@Injectable({
    providedIn: 'root'
  })

export class Appoitement {

 id!: number; // Optionnel, généré par le backend
  firstname!: string;
  lastname!: string;
  birthdate!: string; // Format YYYY-MM-DD
  gender!: 'male' | 'female' | 'other';
  email!: string;
  phone!: string;
  insurance!: string; // Optionnel
  
  // Détails du rendez-vous (Étape 2)
  doctorType!: string;
  otherSpecialist!: string; // Optionnel, uniquement si doctorType === 'other'
  doctor!: Docteur;  // Optionnel, préférence de médecin
  appointmentType!: 'in-person' | 'video';
  preferredDate!: string; // Format YYYY-MM-DD
  preferredTime!: 'morning' | 'afternoon' | 'evening';
  
  // Disponibilités alternatives
  altAvailability!: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  
  // Informations médicales
  reason!: string;
  symptoms!: string; // Optionnel
  firstVisit!: 'yes' | 'no'; // Optionnel
  allergies!: string; // Optionnel
  medications!: string; // Optionnel
  
  // Informations complémentaires
  additionalInfo!: string; // Optionnel
  consent!: boolean;
  
  // Champs potentiellement ajoutés par le backend
  status!: 'pending' | 'confirmed' | 'cancelled';
  createdAt!: string;
  updatedAt!: string;

}

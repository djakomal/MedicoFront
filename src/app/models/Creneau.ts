import { Docteur } from './docteur';
export class Creneau {
    id?: number;
    // jour?: string;
    heureDebut!: string;  
    date!: string ;
    heureFin!: string;
    disponible!: boolean;
     docteurId?: number;
  }
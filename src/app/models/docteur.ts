import { Creneau } from './Creneau';
import {Speciality} from './speciality'

export class Docteur {
  id!: number;
  name!: string;
  username!: string;
  hollyDays!: string;
  email!: string;
  tel!: string;
  professionalAddress!: string;
  licence!: string;

    // specialite?: string;
  speciality!: Speciality;
  numeroLicence!: string;
  anneesExperience!: string;
  photoUrl!: string;
  creneau?: Creneau[];
  cvurl!: string;
  password!: string;
  confirmpassword!: string;
}

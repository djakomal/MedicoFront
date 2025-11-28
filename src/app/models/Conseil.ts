export class Conseil {
    id?: number;
    titre!: string;
    contenu!: string;
    auteur!: string;
    datePublication?: Date;
    imageUrl?: string;
    tags!: string[];
    categorie!: string;
    publie?: boolean;
    nombreVues?: number;
  }
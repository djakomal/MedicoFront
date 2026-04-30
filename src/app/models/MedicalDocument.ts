export interface MedicalDocument {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
    category: 'prescription' | 'analysis' | 'radiology' | 'other';
  }
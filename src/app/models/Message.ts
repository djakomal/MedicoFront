export class Message {
  id!: number;
  type!: 'success' | 'info' | 'alert' | 'error';
  sender!: string;
  subject!: string;
  content!: string;
  date!: string;
  read!: boolean;
  appointmentId!: number;
}

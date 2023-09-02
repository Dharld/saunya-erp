export interface User {
  uid: string;
  token?: string;
  partner_id?: number;
  name: string;
  email: string;
  password: string;
  phone?: boolean;
  image?: string;
  expires_on?: string;
  server?: string;
  db?: string;
}

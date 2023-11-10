export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  verified: boolean;
  image: string;
}

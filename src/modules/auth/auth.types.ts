import { RegisterInput as ZodRegisterInput, LoginInput as ZodLoginInput } from './auth.validators';

export type RegisterInput = ZodRegisterInput;
export type LoginInput = ZodLoginInput;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}


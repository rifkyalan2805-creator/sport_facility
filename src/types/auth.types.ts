export interface RegisterInput {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export interface SafeUser {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: SafeUser;
}

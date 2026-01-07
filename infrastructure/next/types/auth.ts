export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
};

export type LoginData = {
  user: AuthenticatedUser;
  token: string;
};

export type LoginSuccessResponse = {
  status: number;
  code: string;
  message?: string;
  data: LoginData;
};

export type RegisterPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

export type CookieOptions = {
  maxAge: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Mirrors the Go backend's untagged auth.Payload/users.User structs, which
// serialize as PascalCase — unlike the rest of this API.
export interface UserDTO {
  ID: string;
  Name: string;
  Email: string;
  Picture: string;
}

export interface AuthPayloadDTO {
  AccessToken: string;
  RefreshToken: string;
  User: UserDTO;
}

export interface CurrentUserDTO {
  id: string;
  name: string;
  email: string;
}

export interface AuthServiceImpl {
  login(payload: LoginPayload): Promise<AuthPayloadDTO>;
  register(payload: RegisterPayload): Promise<AuthPayloadDTO>;
  getCurrentUser(): Promise<CurrentUserDTO>;
}

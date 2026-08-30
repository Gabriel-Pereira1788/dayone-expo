// auth.Payload/users.User on the Go backend have no `json:"..."` struct tags,
// so they serialize using the exact (PascalCase) Go field names — unlike the
// rest of this API, which is camelCase. Mirrored as-is here on purpose.
export interface User {
  ID: string;
  Name: string;
  Email: string;
  Picture: string;
}

export interface AuthPayload {
  AccessToken: string;
  RefreshToken: string;
  User: User;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

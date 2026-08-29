import { axiosHttpClientImpl } from "@/infra/api";
import type {
  AuthPayloadDTO,
  AuthServiceImpl,
  CurrentUserDTO,
  LoginPayload,
  RegisterPayload,
} from "../../types";

async function login(payload: LoginPayload): Promise<AuthPayloadDTO> {
  const { data } = await axiosHttpClientImpl.post<AuthPayloadDTO>("/auth/login", payload);
  return data;
}

async function register(payload: RegisterPayload): Promise<AuthPayloadDTO> {
  const { data } = await axiosHttpClientImpl.post<AuthPayloadDTO>("/auth/register", payload);
  return data;
}

async function getCurrentUser(): Promise<CurrentUserDTO> {
  const { data } = await axiosHttpClientImpl.get<CurrentUserDTO>("/me");
  return data;
}

export const restAuthServiceImpl: AuthServiceImpl = {
  login,
  register,
  getCurrentUser,
};

import { axiosHttpClientImpl } from "@/infra/api";
import type { AuthServiceImpl, CurrentUserDTO } from "../../types";

async function getCurrentUser(): Promise<CurrentUserDTO> {
  const { data } = await axiosHttpClientImpl.get<CurrentUserDTO>("/me");
  return data;
}

export const restAuthServiceImpl: AuthServiceImpl = {
  getCurrentUser,
};

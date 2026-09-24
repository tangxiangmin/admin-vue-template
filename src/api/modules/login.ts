import http, { customErrorService } from "@/api";
import type { IBaseResponse, ILoginParams, ILoginResult } from "@/typings/api";

export const loginApi = (params: ILoginParams) =>
  customErrorService.post<unknown, IBaseResponse<ILoginResult>>("/login", params);

export const logoutApi = () => http.post<unknown, IBaseResponse<null>>("/logout");

export interface IBaseResponse<T = unknown> {
  code: number | string;
  data: T;
  msg: string;
}

export interface ILoginParams {
  username: string;
  password: string;
}

export interface ILoginResult {
  access_token: string;
}

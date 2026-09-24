export type TLayout = "vertical" | "classic" | "transverse" | "columns";
export type TAssemblySize = "large" | "default" | "small";

export interface IUserInfo {
  name: string;
}

export interface ITabMenu {
  icon: string;
  title: string;
  path: string;
  name: string;
  close: boolean;
  isKeepAlive: boolean;
}

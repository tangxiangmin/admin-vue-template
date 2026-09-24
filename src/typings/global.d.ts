/* Menu */
declare namespace Menu {
  interface IMenuOptions {
    path: string;
    name: string;
    component?: string | (() => Promise<unknown>);
    redirect?: string;
    meta: IMetaProps;
    children?: IMenuOptions[];
  }
  interface IMetaProps {
    permission?: string;
    icon: string;
    title: string;
    activeMenu?: string;
    isLink?: string;
    isHide: boolean;
    isFull: boolean;
    isAffix: boolean;
    isKeepAlive: boolean;
  }
}

interface ImportMetaEnv {
  readonly VITE_GLOB_APP_TITLE: string;
  readonly VITE_ROUTER_MODE: "hash" | "history";
  readonly VITE_API_URL: string;
  readonly VITE_TEMPLATE_DEMO?: string;
}

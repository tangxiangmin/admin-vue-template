import { AxiosHeaders, CanceledError, type AxiosAdapter, type AxiosInstance } from "axios";
import md5 from "md5";
import { watchEffect } from "vue";
import { useAuthStore } from "@/stores/modules/auth";
import { useUserStore } from "@/stores/modules/user";
import type { ICrudApi, IPageQuery } from "@/typings/crud";
import { demoPermission, getDemoPermissions } from "./template";

interface IDemoRequest {
  data: unknown;
  token: string;
}
interface IDemoRoute {
  permission?: string;
  handle: (request: IDemoRequest) => unknown | Promise<unknown>;
}

function crudRoutes<T>(prefix: string, permission: string, api: ICrudApi<T>): Record<string, IDemoRoute> {
  return {
    [`post ${prefix}/listByPage`]: {
      permission: `${permission}.view`,
      handle: ({ data }) => api.getList(data as IPageQuery)
    },
    [`post ${prefix}/add`]: { permission: `${permission}.add`, handle: ({ data }) => api.add(data as T) },
    [`post ${prefix}/edit`]: { permission: `${permission}.edit`, handle: ({ data }) => api.edit(data as T) }
  };
}

const routes: Record<string, IDemoRoute> = {
  "post /login": {
    handle: ({ data }) => {
      const { username, password } = data as { username: string; password: string };
      if (!["admin", "user"].includes(username) || password !== md5("123456")) {
        throw new Error("演示账号为 admin / user，密码为 123456");
      }
      return { access_token: `template-demo-${username}` };
    }
  },
  "post /logout": { handle: () => null },
  "get /user/admin/userInfo": {
    handle: ({ token }) => ({ privilegeList: getDemoPermissions(token).map(privilegeKey => ({ privilegeKey })) })
  },
  ...crudRoutes("/privilege/admin", "permission.privilege", demoPermission.privilege),
  ...crudRoutes("/role/admin", "permission.role", demoPermission.role),
  ...crudRoutes("/user/admin", "permission.user", demoPermission.user)
};

const adapter: AxiosAdapter = async config => {
  if (config.signal?.aborted) {
    const error = new CanceledError("请求已取消");
    error.config = config;
    throw error;
  }
  const token = String(config.headers.get("x-access-token") || "");
  const key = `${config.method?.toLowerCase()} ${config.url}`;
  const route = routes[key];
  let code = 200;
  let msg = "success";
  let data: unknown = null;
  try {
    if (!route) {
      code = 404;
      throw new Error(`演示接口未实现：${key}`);
    }
    if (key !== "post /login" && !["template-demo-admin", "template-demo-user"].includes(token)) {
      code = 401;
      throw new Error("登录失效，请重新登录");
    }
    if (route.permission && !getDemoPermissions(token).includes(route.permission)) {
      code = 403;
      throw new Error("当前账号无权限执行此操作");
    }
    const body: unknown = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    data = (await route.handle({ data: body, token })) ?? null;
  } catch (error) {
    if (code === 200) code = 400;
    msg = error instanceof Error ? error.message : "演示操作失败";
  }
  return { data: { code, msg, data }, status: 200, statusText: "OK", headers: new AxiosHeaders(), config };
};

export function installDemo(services: AxiosInstance[]) {
  services.forEach(service => {
    service.defaults.adapter = adapter;
  });
  const auth = useAuthStore();
  const user = useUserStore();
  // 演示角色或权限变化时同步更新菜单和按钮，不在业务 store 内放置 mock 分支。
  const stop = watchEffect(() => auth.setPermissions(getDemoPermissions(user.token)), { flush: "sync" });
  if (import.meta.hot) import.meta.hot.dispose(stop);
}

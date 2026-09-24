import { RouteRecordRaw } from "vue-router";

import { HOME_URL, LOGIN_URL } from "@/config";
import { businessRouter } from "@/routers/modules/business";

/**
 * staticRouter (静态路由)
 * 业务页面路由（businessRouter）以标准 children 形式挂在 layout 下，
 * 不再通过后端接口返回菜单 JSON 动态 addRoute。
 */
export const staticRouter: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: HOME_URL
  },
  {
    path: LOGIN_URL,
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录"
    }
  },
  {
    path: "/layout",
    name: "layout",
    component: () => import("@/layouts/index.vue"),
    redirect: HOME_URL,
    children: businessRouter as unknown as RouteRecordRaw[]
  }
];

/**
 * errorRouter (错误页面路由)
 */
export const errorRouter = [
  {
    path: "/403",
    name: "403",
    component: () => import("@/components/ErrorMessage/403.vue"),
    meta: {
      title: "403页面"
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/components/ErrorMessage/404.vue"),
    meta: {
      title: "404页面"
    }
  },
  {
    path: "/500",
    name: "500",
    component: () => import("@/components/ErrorMessage/500.vue"),
    meta: {
      title: "500页面"
    }
  },
  // Resolve refresh page, route warnings
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/components/ErrorMessage/404.vue")
  }
];

import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";

import { LOGIN_URL, ROUTER_WHITE_LIST } from "@/config";
import NProgress from "@/config/nprogress";
import { usePageLeaveStore } from "@/stores/modules/pageLeave";
import { getPagePath } from "@/utils/pageRoute";
import { TEMPLATE_DEMO } from "@/config/template";
import { errorRouter, staticRouter } from "@/routers/modules/staticRouter";
import { useAuthStore } from "@/stores/modules/auth";
import { useUserStore } from "@/stores/modules/user";

const mode = import.meta.env.VITE_ROUTER_MODE;

const routerMode = {
  hash: () => createWebHashHistory(),
  history: () => createWebHistory()
};

/**
 * @description 📚 路由参数配置简介
 * @param path ==> 路由菜单访问路径
 * @param name ==> 路由 name (对应页面组件 name, 可用作 KeepAlive 缓存标识 && 按钮权限筛选)
 * @param redirect ==> 路由重定向地址
 * @param component ==> 视图文件路径
 * @param meta ==> 路由菜单元信息
 * @param meta.icon ==> 菜单和面包屑对应的图标
 * @param meta.title ==> 路由标题 (用作 document.title || 菜单的名称)
 * @param meta.activeMenu ==> 当前路由为详情页时，需要高亮的菜单
 * @param meta.isLink ==> 路由外链时填写的访问地址
 * @param meta.isHide ==> 是否在菜单中隐藏 (通常列表详情页需要隐藏)
 * @param meta.isFull ==> 菜单是否全屏 (示例：数据大屏页面)
 * @param meta.isAffix ==> 菜单是否固定在标签页中 (首页通常是固定项)
 * @param meta.isKeepAlive ==> 当前路由是否缓存
 * */
const router = createRouter({
  history: routerMode[mode](),
  routes: [...staticRouter, ...errorRouter],
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

/**
 * @description 路由拦截 beforeEach
 * */
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  // 切换数据模式后重新登录，避免沿用另一模式的会话。
  if (userStore.token && userStore.token.startsWith("template-demo-") !== TEMPLATE_DEMO) {
    userStore.setToken("");
  }

  if (from.matched.length && getPagePath(to) !== getPagePath(from)) {
    if (!(await usePageLeaveStore().request([getPagePath(from)]))) return next(false);
  }

  // 1.首次进入或路径变化时显示进度条，同一页面的 query 更新不触发。
  if (!from.matched.length || to.path !== from.path) NProgress.start();

  // 2.动态设置标题
  const title = import.meta.env.VITE_GLOB_APP_TITLE;
  document.title = to.meta.title ? `${to.meta.title} - ${title}` : title;

  // 3.判断是访问登陆页，有 Token 就在当前页面，没有 Token 重置路由到登陆页
  if (to.path.toLocaleLowerCase() === LOGIN_URL) {
    if (userStore.token) return next(from.path === LOGIN_URL ? "/home/index" : from.fullPath);
    return next();
  }

  // 4.判断访问页面是否在路由白名单地址(静态路由)中，如果存在直接放行
  if (ROUTER_WHITE_LIST.includes(to.path)) return next();

  // 5.判断是否有 Token，没有重定向到 login 页面
  if (!userStore.token) return next({ path: LOGIN_URL, replace: true });

  try {
    await authStore.ensurePermissions();
  } catch {
    return next({ path: userStore.token ? "/500" : LOGIN_URL, replace: true });
  }
  if (
    to.matched.some(
      record => typeof record.meta.permission === "string" && !authStore.hasPermission(record.meta.permission)
    )
  ) {
    return next({ path: "/403", replace: true });
  }

  // 6.正常访问页面
  next();
});

/**
 * @description 路由跳转错误
 * */
router.onError(error => {
  NProgress.done();
  console.warn("路由错误", error.message);
});

/**
 * @description 路由跳转结束
 * */
router.afterEach((to, from, failure) => {
  NProgress.done();
  if (!failure && getPagePath(to) !== getPagePath(from)) usePageLeaveStore().discard([getPagePath(from)]);
});

export default router;

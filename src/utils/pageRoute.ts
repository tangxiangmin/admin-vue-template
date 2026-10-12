import type { RouteLocationNormalizedLoaded, RouteLocationNormalized } from "vue-router";

function formatPagePath(route: RouteLocationNormalizedLoaded | RouteLocationNormalized, includeSearch: boolean) {
  const query = { ...route.query };
  const inboundKeys = route.meta.queryInboundKeys;
  if (Array.isArray(inboundKeys)) inboundKeys.forEach(key => delete query[key]);
  if (query.drawer) {
    delete query.drawer;
    delete query.id;
  }
  if (!includeSearch) {
    if (route.meta.queryTabs) delete query.tab;
    Object.keys(query)
      .filter(key => key === "__query_state__" || key.startsWith("__query_state__:"))
      .forEach(key => delete query[key]);
  }
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) params.append(key, item ?? "");
    }
  });
  const search = params.toString();
  return `${route.path}${search ? `?${search}` : ""}${route.hash}`;
}

/** 抽屉动作与搜索状态不参与工作标签和页面缓存标识。 */
export function getPagePath(route: RouteLocationNormalizedLoaded | RouteLocationNormalized) {
  return formatPagePath(route, false);
}

/** 工作标签返回地址保留搜索状态，移除一次性的抽屉动作。 */
export function getPageFullPath(route: RouteLocationNormalizedLoaded | RouteLocationNormalized) {
  return formatPagePath(route, true);
}

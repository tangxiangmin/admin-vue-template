import { computed, onActivated, onDeactivated, onScopeDispose, ref, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/modules/user";
import { getPagePath } from "@/utils/pageRoute";
import type { TSearchStoreOptions } from "@/typings/search";

interface ISearchStoreSetting<T> {
  defaults: () => T;
  validate: (value: unknown) => value is T;
  options: () => TSearchStoreOptions | undefined;
}

// memory 仅在当前页面内跨组件重挂载保留，切换 pathname 后清空。
const memoryStores = new Map<string, string>();
let writes = Promise.resolve();

export function useSearchStore<T extends object>(setting: ISearchStoreSetting<T>) {
  const router = useRouter();
  const user = useUserStore();
  const pagePath = getPagePath(router.currentRoute.value);
  const scope = user.userInfo.name;
  let alive = true;
  let deactivated = false;
  onScopeDispose(() => {
    alive = false;
  });
  onDeactivated(() => {
    deactivated = true;
  });
  const storageError = ref("");
  const config = computed(() => {
    const options = setting.options();
    const key = options && "key" in options ? options.key : undefined;
    return {
      type: options?.type ?? "url",
      urlKey: key ? `__query_state__:${key}` : "__query_state__",
      storageKey: `forma:query:v1:${encodeURIComponent(scope)}:${encodeURIComponent(pagePath)}:${encodeURIComponent(key ?? "default")}`
    };
  });
  const reportError = (error: unknown) => {
    storageError.value = error instanceof Error ? error.message : "搜索条件保存失败";
  };
  const hasStored = ref(false);
  function read(): T {
    hasStored.value = false;
    try {
      let raw: string | null | undefined;
      if (config.value.type === "url") {
        const value = router.currentRoute.value.query[config.value.urlKey];
        if (value === undefined) return setting.defaults();
        if (typeof value !== "string") throw new Error("URL 搜索条件格式无效");
        const base64 = value
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .padEnd(Math.ceil(value.length / 4) * 4, "=");
        raw = decodeURIComponent(atob(base64));
      } else if (config.value.type === "sessionStorage") {
        raw = window.sessionStorage.getItem(config.value.storageKey);
      } else if (config.value.type === "memory") {
        raw = memoryStores.get(config.value.storageKey);
      }
      if (!raw) return setting.defaults();
      const value: unknown = JSON.parse(raw);
      if (!setting.validate(value)) throw new Error("搜索条件结构无效，已使用默认值");
      hasStored.value = true;
      return value;
    } catch (error) {
      reportError(error);
      return setting.defaults();
    }
  }
  const restored = shallowRef<T>(read());
  const pendingUrls = new Set<string>();
  function set(value: T): Promise<void> {
    const target = { ...config.value };
    const raw = JSON.stringify(value);
    // URL 写入串行合并最新路由参数，避免连续查询或同页多表格互相覆盖。
    writes = writes.then(async () => {
      if (!alive || target.type !== config.value.type || target.storageKey !== config.value.storageKey) return;
      storageError.value = "";
      try {
        if (target.type === "sessionStorage") {
          window.sessionStorage.setItem(target.storageKey, raw);
        } else if (target.type === "memory") {
          if (getPagePath(router.currentRoute.value) === pagePath) memoryStores.set(target.storageKey, raw);
        } else if (target.type === "url") {
          const route = router.currentRoute.value;
          if (getPagePath(route) !== pagePath) return;
          const encoded = btoa(encodeURIComponent(raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          if (route.query[target.urlKey] === encoded) return;
          pendingUrls.add(encoded);
          try {
            const failure = await router.replace({
              path: route.path,
              query: { ...route.query, [target.urlKey]: encoded },
              hash: route.hash
            });
            if (failure) throw new Error("搜索条件未能写入 URL");
          } finally {
            pendingUrls.delete(encoded);
          }
        }
      } catch (error) {
        reportError(error);
      }
    });
    return writes;
  }
  watch(
    () => router.currentRoute.value,
    (route, previous) => {
      if (route.path !== previous.path) memoryStores.clear();
      if (config.value.type !== "url" || getPagePath(route) !== pagePath) return;
      const raw = route.query[config.value.urlKey];
      if (typeof raw === "string" && pendingUrls.has(raw)) return;
      if (getPagePath(previous) === pagePath && raw === previous.query[config.value.urlKey]) return;
      storageError.value = "";
      restored.value = read();
    },
    { flush: "sync" }
  );
  watch(config, () => {
    if (getPagePath(router.currentRoute.value) !== pagePath) return;
    storageError.value = "";
    restored.value = read();
  });
  onActivated(() => {
    if (!deactivated) return;
    deactivated = false;
    if (config.value.type === "sessionStorage" || config.value.type === "memory") restored.value = read();
  });
  return { restored, set, storageError, hasStored };
}

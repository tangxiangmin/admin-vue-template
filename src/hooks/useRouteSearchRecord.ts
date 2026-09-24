import { useStorage } from "@vueuse/core";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/modules/user";
import { createStorageSerializer } from "@/utils/storage";

interface IRouteSearchRecordOptions<T> {
  validate: (value: unknown) => value is T;
  scope?: string;
  key?: string;
  version?: number;
  storage?: "local" | "session";
}

export function useRouteSearchRecord<T extends object>(defaults: () => T, options: IRouteSearchRecordOptions<T>) {
  const route = useRoute();
  const user = useUserStore();
  // 在 setup 时固定所属页面，避免 KeepAlive 页面随着全局 route 变化写入其他页面。
  const routeKey = options.key ?? String(route.name ?? route.path);
  const scope = options.scope ?? user.userInfo.name;
  const storageKey = `forma:search:v${options.version ?? 1}:${encodeURIComponent(scope)}:${encodeURIComponent(routeKey)}`;
  const storageError = ref("");
  const onError = (error: unknown) => {
    storageError.value = error instanceof Error ? error.message : "搜索条件保存失败";
  };
  // 包装访问过程，让禁用浏览器存储时 useStorage 仍保留内存中的搜索状态。
  const storage = {
    getItem: (key: string) => getStorage().getItem(key),
    setItem: (key: string, value: string) => getStorage().setItem(key, value),
    removeItem: (key: string) => getStorage().removeItem(key)
  };
  function getStorage() {
    return options.storage === "session" ? window.sessionStorage : window.localStorage;
  }
  const searchParams = useStorage<T>(storageKey, defaults, storage, {
    serializer: createStorageSerializer({ defaults, validate: options.validate, onError }),
    writeDefaults: false,
    flush: "sync",
    // 搜索草稿属于当前页面，不同步其他标签页正在输入的条件。
    listenToStorageChanges: false,
    onError
  });
  function reset() {
    storageError.value = "";
    searchParams.value = defaults();
  }
  return { searchParams, reset, storageKey, storageError };
}

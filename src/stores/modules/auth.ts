import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { getCurrentPermissions } from "@/api/modules/permission";
import { businessRouter } from "@/routers/modules/business";
import { useUserStore } from "@/stores/modules/user";

export const useAuthStore = defineStore("admin-template-auth", () => {
  const user = useUserStore();
  const permissions = ref<string[]>([]);
  const loadedToken = ref("");
  let pending: Promise<void> | undefined;
  let pendingToken = "";
  const permissionKeys = computed(() => permissions.value);
  const hasPermission = (key: string | string[]) => {
    const keys = Array.isArray(key) ? key : [key];
    return !!user.token && keys.length > 0 && keys.every(item => permissionKeys.value.includes(item));
  };
  function filterMenus(menus: Menu.IMenuOptions[]): Menu.IMenuOptions[] {
    return menus.flatMap(menu => {
      if (menu.meta.permission && !hasPermission(menu.meta.permission)) return [];
      const children = menu.children ? filterMenus(menu.children) : undefined;
      if (children && !children.length) return [];
      return [{ ...menu, meta: { ...menu.meta }, children, redirect: children ? children[0].path : menu.redirect }];
    });
  }
  const authMenuListGet = computed(() => filterMenus(businessRouter));
  function visible(menus: Menu.IMenuOptions[]): Menu.IMenuOptions[] {
    return menus
      .filter(menu => !menu.meta.isHide)
      .map(menu => ({ ...menu, children: menu.children ? visible(menu.children) : undefined }));
  }
  const showMenuListGet = computed(() => visible(authMenuListGet.value));
  const flatten = (menus: Menu.IMenuOptions[]): Menu.IMenuOptions[] =>
    menus.flatMap(menu => [menu, ...flatten(menu.children ?? [])]);
  const flatMenuListGet = computed(() => flatten(authMenuListGet.value));
  const breadcrumbListGet = computed(() => {
    const result: Record<string, Menu.IMenuOptions[]> = {};
    function walk(menus: Menu.IMenuOptions[], parent: Menu.IMenuOptions[] = []) {
      menus.forEach(menu => {
        result[menu.path] = [...parent, menu];
        walk(menu.children ?? [], result[menu.path]);
      });
    }
    walk(authMenuListGet.value);
    return result;
  });
  function setPermissions(keys: string[]) {
    permissions.value = keys;
    loadedToken.value = user.token;
  }
  async function ensurePermissions() {
    if (loadedToken.value === user.token) return;
    const token = user.token;
    if (!token) return;
    if (pending && pendingToken === token) return pending;
    pendingToken = token;
    const task = getCurrentPermissions().then(keys => {
      if (user.token === token) {
        permissions.value = keys;
        loadedToken.value = token;
      }
    });
    pending = task;
    try {
      await task;
    } finally {
      if (pending === task) pending = undefined;
    }
  }
  watch(
    () => user.token,
    () => {
      permissions.value = [];
      loadedToken.value = "";
    },
    { flush: "sync" }
  );
  return { showMenuListGet, flatMenuListGet, breadcrumbListGet, hasPermission, ensurePermissions, setPermissions };
});

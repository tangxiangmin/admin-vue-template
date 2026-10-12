import { computed, inject, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPagePath } from "@/utils/pageRoute";
import { usePageLeaveStore } from "@/stores/modules/pageLeave";
import { useGlobalStore } from "@/stores/modules/global";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { useTabsStore } from "@/stores/modules/tabs";
import type { ITabMenu } from "@/typings/store";

/** 标签菜单的目标由调用方提供，右键不会提前改变当前路由。 */
export function useTabActions(getTab: () => ITabMenu | undefined) {
  const route = useRoute();
  const router = useRouter();
  const tabs = useTabsStore();
  const pageLeave = usePageLeaveStore();
  const keepAlive = useKeepAliveStore();
  const global = useGlobalStore();
  const refreshPage = inject<(visible: boolean) => void>("refresh");
  const target = computed(() => tabs.tabsMenuList.find(tab => tab.path === getTab()?.path));
  const index = computed(() => tabs.tabsMenuList.findIndex(tab => tab.path === target.value?.path));
  const canClose = computed(() => Boolean(target.value?.close));
  const canCloseLeft = computed(
    () => index.value >= 0 && tabs.tabsMenuList.slice(0, index.value).some(tab => tab.close)
  );
  const canCloseRight = computed(
    () => index.value >= 0 && tabs.tabsMenuList.slice(index.value + 1).some(tab => tab.close)
  );
  const canCloseOther = computed(
    () => Boolean(target.value) && tabs.tabsMenuList.some(tab => tab.close && tab.path !== target.value?.path)
  );
  const canCloseAll = computed(() => tabs.tabsMenuList.some(tab => tab.close));
  async function activate(tab: ITabMenu) {
    if (getPagePath(route) === tab.path) return true;
    const failure = await router.push(tab.fullPath ?? tab.path);
    return !failure && getPagePath(route) === tab.path;
  }
  async function refresh() {
    const tab = target.value;
    if (!tab || !refreshPage) return;
    const paths = [...new Set([getPagePath(route), tab.path])];
    await pageLeave.perform(paths, async () => {
      if (!(await activate(tab))) return false;
      pageLeave.discard([tab.path]);
      if (tab.isKeepAlive) keepAlive.removeKeepAliveName(tab.path);
      refreshPage(false);
      await nextTick();
      if (tab.isKeepAlive) keepAlive.addKeepAliveName(tab.path);
      refreshPage(true);
      return true;
    });
  }
  async function maximize() {
    const tab = target.value;
    if (tab && (await activate(tab))) global.setGlobalState("maximize", true);
  }
  const close = () => (target.value?.close ? tabs.removeTabs(target.value.path) : undefined);
  const closeLeft = () => (target.value ? tabs.closeTabsOnSide(target.value.path, "left") : undefined);
  const closeRight = () => (target.value ? tabs.closeTabsOnSide(target.value.path, "right") : undefined);
  const closeOther = () => (target.value ? tabs.closeMultipleTab(target.value.path) : undefined);
  const closeAll = () => tabs.closeMultipleTab();
  return {
    target,
    canClose,
    canCloseLeft,
    canCloseRight,
    canCloseOther,
    canCloseAll,
    refresh,
    maximize,
    close,
    closeLeft,
    closeRight,
    closeOther,
    closeAll
  };
}

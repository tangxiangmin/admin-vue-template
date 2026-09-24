<template>
  <div
    class="workbench"
    :class="[
      `workbench-${layout}`,
      {
        'is-mobile': isMobile,
        'is-tablet': isTablet,
        'is-narrow': isNarrow,
        'is-collapsed': global.isCollapse,
        'has-sidebar': hasSidebar,
        'aside-inverted': global.asideInverted,
        'header-inverted': global.headerInverted
      }
    ]"
  >
    <button
      v-if="hasSidebar && !global.isCollapse"
      class="mobile-nav-backdrop"
      aria-label="关闭导航"
      @click="global.setGlobalState('isCollapse', true)"
    />
    <aside
      v-if="layout === 'columns'"
      class="workbench-rail"
      aria-label="一级导航"
    >
      <Brand
        compact
        class="my-sm"
      />
      <nav class="rail-nav flex-1 min-h-0 overflow-y-auto px-xs py-sm">
        <button
          class="flex flex-col items-center justify-center gap-xs w-full min-h-header mb-xs px-1 py-xs border-0 rounded-md bg-transparent text-ui-muted text-xs cursor-pointer hover:bg-ui-soft"
          v-for="menu in menus"
          :key="menu.path"
          type="button"
          :title="menu.meta.title"
          :aria-label="menu.meta.title"
          :aria-pressed="selectedRoot === menu.path"
          :class="{ active: selectedRoot === menu.path }"
          @click="selectRoot(menu)"
        >
          <i
            class="text-xl"
            :class="menu.meta.icon"
          />
          <span class="max-w-full truncate">{{ menu.meta.title }}</span>
        </button>
      </nav>
    </aside>
    <aside
      v-if="hasSidebar"
      class="workbench-sidebar"
      aria-label="主导航"
    >
      <Brand
        class="my-sm"
        v-if="layout === 'vertical'"
        :compact="global.isCollapse"
      />
      <div
        v-else
        class="sidebar-title flex items-center h-header px-lg text-md font-semibold shrink-0"
      >
        {{ layout === "columns" ? currentRoot?.meta.title : "工作空间" }}
      </div>
      <nav class="workspace-nav flex-1 min-h-0 overflow-y-auto px-sm pt-sm">
        <div class="nav-caption mx-sm mb-xs text-sm text-ui-muted font-medium">
          {{ layout === "columns" ? "模块导航" : "工作空间" }}
        </div>
        <el-menu
          class="workspace-menu"
          popper-class="workspace-menu-popper"
          :default-active="activeMenu"
          :collapse="global.isCollapse"
          :unique-opened="global.accordion"
          :collapse-transition="false"
        >
          <SubMenu :menu-list="sidebarMenus" />
        </el-menu>
      </nav>
    </aside>
    <header class="workbench-header">
      <div class="header-leading flex items-center gap-md text-md min-w-0 flex-1">
        <Brand
          v-if="layout === 'classic' || layout === 'transverse'"
          class="header-brand"
        />
        <button
          v-if="hasSidebar"
          class="icon-button ui-icon-button"
          aria-label="展开或收起导航"
          @click="global.setGlobalState('isCollapse', !global.isCollapse)"
        >
          <i :class="global.isCollapse ? 'i-ep-expand' : 'i-ep-fold'" />
        </button>
        <el-breadcrumb
          v-if="global.breadcrumb"
          class="header-breadcrumb"
          separator="/"
        >
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbs"
            :key="item.path"
            :to="index < breadcrumbs.length - 1 ? item.path : undefined"
          >
            <i
              v-if="global.breadcrumbIcon"
              :class="item.meta.icon"
            />
            {{ item.meta.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions flex items-center gap-md text-md shrink-0">
        <button
          class="search-trigger flex items-center gap-xs px-sm py-xs border border-solid border-ui-border rounded-md bg-ui-canvas text-ui-muted text-sm cursor-pointer"
          @click="searchVisible = true"
        >
          <i class="i-ep-search" />
          <span>搜索页面</span>
          <kbd class="text-xs ml-lg">⌘ K</kbd>
        </button>
        <button
          class="icon-button ui-icon-button"
          :aria-label="global.isDark ? '切换浅色模式' : '切换深色模式'"
          @click="toggleDark"
        >
          <i :class="global.isDark ? 'i-ep-sunny' : 'i-ep-moon'" />
        </button>
        <ThemeSetting class="icon-button ui-icon-button" />
        <Account class="header-account pl-md border-l border-l-solid border-ui-border" />
      </div>
    </header>
    <nav
      v-if="layout === 'transverse'"
      class="horizontal-navigation"
      aria-label="主导航"
    >
      <el-menu
        class="workspace-menu"
        mode="horizontal"
        popper-class="workspace-menu-popper"
        :default-active="activeMenu"
        :ellipsis="true"
      >
        <template
          v-for="menu in menus"
          :key="menu.path"
        >
          <el-sub-menu
            v-if="menu.children?.length"
            :index="menu.path"
          >
            <template #title>
              <el-icon><i :class="menu.meta.icon" /></el-icon>
              <span>{{ menu.meta.title }}</span>
            </template>
            <SubMenu :menu-list="menu.children" />
          </el-sub-menu>
          <el-menu-item
            v-else
            :index="menu.path"
            @click="navigate(menu)"
          >
            <el-icon><i :class="menu.meta.icon" /></el-icon>
            <span>{{ menu.meta.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </nav>
    <div class="workbench-body"><Main /></div>
    <el-dialog
      v-model="searchVisible"
      title="搜索页面"
      width="var(--ui-size-search)"
      class="workspace-search-dialog"
      @opened="searchInput?.focus()"
    >
      <el-input
        ref="searchInput"
        v-model="search"
        placeholder="输入页面名称或路径"
        clearable
      >
        <template #prefix><i class="i-ep-search" /></template>
      </el-input>
      <div class="search-results flex flex-col gap-xs mt-md max-h-chart overflow-y-auto">
        <router-link
          class="flex items-center gap-sm p-sm rounded-md no-underline text-md hover:bg-ui-soft"
          v-for="item in searchResults"
          :key="item.path"
          :to="item.path"
          @click="searchVisible = false"
        >
          <i :class="item.meta.icon" />
          <span>{{ item.meta.title }}</span>
          <small class="ml-auto text-sm text-ui-muted">{{ item.path }}</small>
          <i class="i-ep-right" />
        </router-link>
        <el-empty
          v-if="!searchResults.length"
          description="没有找到页面"
        />
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { InputInstance } from "element-plus";
import { useEventListener, useMediaQuery } from "@vueuse/core";
import type { TLayout } from "@/typings/store";
import Main from "@/layouts/components/Main/index.vue";
import SubMenu from "@/layouts/components/Menu/SubMenu.vue";
import ThemeSetting from "@/layouts/components/Header/components/ThemeSetting.vue";
import Brand from "./Brand.vue";
import Account from "./Account.vue";
import { useAuthStore } from "@/stores/modules/auth";
import { useGlobalStore } from "@/stores/modules/global";
import { useTheme } from "@/hooks/useTheme";
import { UI_CONFIG } from "@/config/ui";
const props = defineProps<{ layout: TLayout }>();
const isMobile = useMediaQuery(`(max-width: ${UI_CONFIG.breakpoints.sm})`);
const isTablet = useMediaQuery(`(max-width: ${UI_CONFIG.breakpoints.lg})`);
const isNarrow = useMediaQuery(`(max-width: ${UI_CONFIG.breakpoints.xl})`);
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const global = useGlobalStore();
const { switchDark } = useTheme();
const menus = computed(() => auth.showMenuListGet);
const activeMenu = computed(() => (typeof route.meta.activeMenu === "string" ? route.meta.activeMenu : route.path));
const breadcrumbs = computed(() => auth.breadcrumbListGet[activeMenu.value] ?? []);
const leaves = (items: Menu.IMenuOptions[]): Menu.IMenuOptions[] =>
  items.flatMap(item => (item.children?.length ? leaves(item.children) : [item]));
const selectedRoot = ref("");
const currentRoot = computed(() => menus.value.find(menu => menu.path === selectedRoot.value));
const sidebarMenus = computed(() => (props.layout === "columns" ? (currentRoot.value?.children ?? []) : menus.value));
const hasSidebar = computed(
  () => props.layout !== "transverse" && (props.layout !== "columns" || sidebarMenus.value.length > 0)
);
watch(
  [activeMenu, menus],
  () => {
    const root = menus.value.find(
      menu =>
        menu.path === activeMenu.value || leaves(menu.children ?? []).some(child => child.path === activeMenu.value)
    );
    selectedRoot.value = root?.path ?? "";
  },
  { immediate: true }
);
function navigate(menu: Menu.IMenuOptions) {
  if (menu.meta.isLink) {
    window.open(menu.meta.isLink, "_blank", "noopener,noreferrer");
    return;
  }
  return router.push(menu.path);
}
function selectRoot(menu: Menu.IMenuOptions) {
  if (menu.children?.length) {
    selectedRoot.value = menu.path;
    if (isMobile.value) global.setGlobalState("isCollapse", false);
    return;
  }
  navigate(menu);
}
const searchVisible = ref(false);
const search = ref("");
const searchInput = ref<InputInstance>();
const searchResults = computed(() =>
  leaves(menus.value).filter(item =>
    `${item.meta.title} ${item.path}`.toLowerCase().includes(search.value.toLowerCase())
  )
);
function toggleDark() {
  global.setGlobalState("isDark", !global.isDark);
  switchDark();
}
function shortcut(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchVisible.value = !searchVisible.value;
  }
  if (event.key === "Escape" && isMobile.value) global.setGlobalState("isCollapse", true);
}
onMounted(() => {
  if (isTablet.value) global.setGlobalState("isCollapse", true);
});
useEventListener(document, "keydown", shortcut);
</script>
<style scoped lang="scss">
@use "./index";
</style>
<style lang="scss">
@use "./menu";
</style>

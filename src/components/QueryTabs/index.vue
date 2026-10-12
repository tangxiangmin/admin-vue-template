<template>
  <el-tabs
    :model-value="active"
    :before-leave="switchTab"
  >
    <el-tab-pane
      v-for="item in items"
      :key="item.key"
      :name="item.key"
      :label="item.label"
    />
  </el-tabs>
  <slot
    :key="active"
    :tab="active"
  />
</template>
<script setup lang="ts">
import { computed, provide, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { queryTabsScopeKey } from "@/hooks/useQueryTabsScope";
const props = defineProps<{ items: { key: string; label: string }[] }>();
const route = useRoute(),
  router = useRouter();
const active = computed(() =>
  props.items.some(item => item.key === route.query.tab) ? String(route.query.tab) : (props.items[0]?.key ?? "")
);
const cache = new Map<string, string | undefined>();
const closers = new Set<() => Promise<boolean>>();
const switching = ref(false);
provide(queryTabsScopeKey, {
  register(close) {
    closers.add(close);
    return () => {
      closers.delete(close);
    };
  }
});
async function switchTab(name: string | number) {
  const next = String(name);
  // modelValue 更新也会触发 beforeLeave，已与路由一致时允许内部选中态同步。
  if (next === active.value) return true;
  if (switching.value) return false;
  switching.value = true;
  try {
    for (const close of closers) if (!(await close())) return false;
    const current = route.query.__query_state__;
    cache.set(active.value, typeof current === "string" ? current : undefined);
    const failure = await router.replace({
      path: route.path,
      query: { ...route.query, tab: next, __query_state__: cache.get(next) },
      hash: route.hash
    });
    return !failure && active.value === next;
  } finally {
    switching.value = false;
  }
}
</script>

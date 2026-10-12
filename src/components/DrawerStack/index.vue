<template>
  <el-drawer
    v-for="(layer, index) in renderedLayers"
    :key="layer.id"
    :model-value="displayedId === layer.id"
    :title="layer.title"
    :size="narrow ? '100%' : layer.mode === 'detail' ? 'var(--ui-size-detail-drawer)' : 'var(--ui-size-form-drawer)'"
    :modal="false"
    :lock-scroll="false"
    :destroy-on-close="false"
    :modal-class="isTop(layer) ? 'crud-drawer-overlay' : 'crud-drawer-overlay crud-drawer-overlay--inactive'"
    :close-on-click-modal="false"
    :close-on-press-escape="isTop(layer) && !busy"
    :show-close="isTop(layer) && !busy"
    :before-close="() => requestClose(layer)"
    append-to-body
    class="crud-drawer"
    @closed="removeClosedLayer(layer)"
  >
    <template #header>
      <div
        class="ui-row min-w-0"
        :inert="!isTop(layer)"
      >
        <el-button
          v-if="index > 0"
          text
          :disabled="busy || !isTop(layer)"
          @click="requestClose(layer)"
        >
          返回上层
        </el-button>
        <span class="drawer-title text-lg font-semibold">
          <slot
            name="title"
            :layer="layer"
          >
            {{ layer.title }}
          </slot>
        </span>
      </div>
    </template>
    <div :inert="!isTop(layer)">
      <slot :layer="layer" />
    </div>
    <template #footer>
      <div
        class="ui-between"
        :inert="!isTop(layer)"
      >
        <el-button
          v-if="index > 0"
          text
          :disabled="busy || !isTop(layer)"
          @click="requestReset(layer)"
        >
          返回列表
        </el-button>
        <span v-else />
        <div class="ui-row">
          <slot
            name="footer"
            :layer="layer"
          />
        </div>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts" generic="T">
import { computed, ref, shallowRef, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { UI_CONFIG } from "@/config/ui";
import type { IDrawerLayer } from "@/typings/crud";
const props = defineProps<{ layers: IDrawerLayer<T>[]; busy: boolean; active: boolean }>();
const emit = defineEmits<{ close: []; reset: [] }>();
const narrow = useMediaQuery(`(max-width: ${UI_CONFIG.breakpoints.md})`);
const top = computed(() => props.layers.at(-1));
// 每层独立挂载；新栈顶进入与原栈顶退出并行，移出栈的层在退出结束后卸载。
const renderedLayers = shallowRef<IDrawerLayer<T>[]>([]);
const displayedId = ref<number>();
const closingIds = new Set<number>();
const isOpen = (layer: IDrawerLayer<T>) => props.layers.some(current => current.id === layer.id);
const isTop = (layer: IDrawerLayer<T>) => props.active && displayedId.value === layer.id && top.value?.id === layer.id;
function syncLayers() {
  const exiting = renderedLayers.value.filter(layer => !isOpen(layer) && closingIds.has(layer.id));
  renderedLayers.value = [...props.layers, ...exiting];
}
watch(
  () => [props.layers, props.active] as const,
  () => {
    const nextId = props.active ? top.value?.id : undefined;
    if (displayedId.value !== nextId && displayedId.value !== undefined) {
      closingIds.add(displayedId.value);
    }
    if (nextId !== undefined) closingIds.delete(nextId);
    displayedId.value = nextId;
    syncLayers();
  },
  { immediate: true }
);
function requestClose(layer: IDrawerLayer<T>) {
  if (isTop(layer) && !props.busy) emit("close");
}
function requestReset(layer: IDrawerLayer<T>) {
  if (isTop(layer) && !props.busy) emit("reset");
}
function removeClosedLayer(layer: IDrawerLayer<T>) {
  closingIds.delete(layer.id);
  syncLayers();
}
</script>
<style lang="scss">
.drawer-title {
  min-width: 0;
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.crud-drawer-overlay {
  pointer-events: none;
}
.crud-drawer.el-drawer {
  pointer-events: auto;
  max-width: 100vw;
}
.crud-drawer-overlay--inactive .crud-drawer.el-drawer {
  pointer-events: none;
}
.crud-drawer-overlay.el-drawer-fade-enter-active,
.crud-drawer.el-drawer {
  transition-duration: var(--ui-motion-drawer-enter-duration, 300ms);
  transition-timing-function: var(--ui-motion-drawer-enter-easing, ease-in-out);
}
.crud-drawer-overlay.el-drawer-fade-leave-active,
.crud-drawer-overlay.el-drawer-fade-leave-active .crud-drawer.el-drawer {
  transition-duration: var(--ui-motion-drawer-leave-duration, 180ms);
  transition-timing-function: var(--ui-motion-drawer-leave-easing, ease-in-out);
}
@media (prefers-reduced-motion: reduce) {
  .crud-drawer-overlay.el-drawer-fade-enter-active,
  .crud-drawer-overlay.el-drawer-fade-leave-active,
  .crud-drawer-overlay.el-drawer-fade-leave-active .crud-drawer.el-drawer,
  .crud-drawer.el-drawer {
    transition-duration: 1ms;
  }
}
</style>

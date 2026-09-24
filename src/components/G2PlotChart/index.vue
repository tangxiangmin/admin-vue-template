<template>
  <div class="relative min-w-0 h-chart">
    <div
      ref="container"
      class="w-full h-full"
      role="img"
      :aria-label="label"
    />
    <div
      v-if="error"
      class="absolute inset-0 flex flex-col items-center justify-center bg-ui-surface text-ui-muted"
      role="alert"
    >
      <p>图表渲染失败</p>
      <el-button
        size="small"
        @click="retry"
      >
        重试
      </el-button>
    </div>
    <div
      v-else-if="empty"
      class="absolute inset-0 flex flex-col items-center justify-center bg-ui-surface text-ui-muted"
    >
      <el-empty description="当前筛选暂无数据" />
    </div>
  </div>
</template>
<script setup lang="ts" generic="T extends object">
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";

interface IPlot {
  render: () => void;
  update: (options: T) => void;
  changeSize: (width: number, height: number) => void;
  destroy: () => void;
}
const props = withDefaults(
  defineProps<{
    options: T;
    create: (container: HTMLElement, options: T) => IPlot;
    label: string;
    empty?: boolean;
  }>(),
  { empty: false }
);
const container = ref<HTMLElement>();
const error = ref(false);
// 图表实例保留在普通变量中，避免 Vue 深层代理 Canvas 对象。
let plot: IPlot | undefined;
let active = false;
function destroy() {
  plot?.destroy();
  plot = undefined;
}
function sync() {
  const element = container.value;
  if (!active || !element) return;
  if (props.empty) {
    destroy();
    error.value = false;
    return;
  }
  const { width, height } = element.getBoundingClientRect();
  if (!width || !height || error.value) return;
  try {
    if (!plot) {
      plot = props.create(element, props.options);
      plot.render();
    } else {
      plot.update(props.options);
    }
    plot.changeSize(width, height);
  } catch (cause) {
    destroy();
    error.value = true;
    console.error("G2Plot 渲染失败", cause);
  }
}
function retry() {
  error.value = false;
  sync();
}
watch(() => props.options, retry, { flush: "post" });
watch(() => props.empty, retry, { flush: "post" });
useResizeObserver(container, () => {
  if (!active || error.value) return;
  const element = container.value;
  if (!element) return;
  const { width, height } = element.getBoundingClientRect();
  if (width && height) {
    if (plot) plot.changeSize(width, height);
    else sync();
  }
});
onMounted(() => {
  active = true;
  sync();
});
onActivated(() => {
  active = true;
  sync();
});
onDeactivated(() => {
  active = false;
  destroy();
});
onBeforeUnmount(() => {
  active = false;
  destroy();
});
</script>

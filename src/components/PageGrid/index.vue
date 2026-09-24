<template>
  <div
    class="grid grid-cols-1 gap-lg min-w-0"
    :class="columnClasses[columns]"
  >
    <slot />
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ columns?: 2 | 3 | 4 }>(), { columns: 2 });
// 完整静态类名，供 UnoCSS 扫描；不拼接 grid-cols-${n}。
const columnClasses = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" };
</script>

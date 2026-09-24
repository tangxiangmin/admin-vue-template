<template>
  <router-link
    to="/home/index"
    class="workbench-brand flex items-center justify-center gap-sm h-header shrink-0 no-underline text-ui-text"
    aria-label="Forma 工作台首页"
  >
    <span
      class="relative grid place-content-center w-9 h-9 rounded-md bg-ui-accent text-white font-serif text-3xl font-bold leading-none"
    >
      f
      <span class="absolute right-1 bottom-0">.</span>
    </span>
    <span
      v-if="!compact"
      class="brand-name text-2xl font-bold tracking-tight"
    >
      forma
    </span>
  </router-link>
</template>
<script setup lang="ts">
defineProps<{ compact?: boolean }>();
</script>

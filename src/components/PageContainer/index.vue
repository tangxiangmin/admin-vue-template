<template>
  <section class="ui-stack w-full gap-lg">
    <header
      v-if="title"
      class="ui-between gap-md"
    >
      <div class="min-w-0">
        <h1 class="m-0 text-2xl font-semibold leading-snug text-ui-text">{{ title }}</h1>
        <p
          v-if="description"
          class="ui-description mt-xs"
        >
          {{ description }}
        </p>
      </div>
      <div
        v-if="$slots.actions"
        class="ui-row"
      >
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>
<script setup lang="ts">
defineProps<{ title?: string; description?: string }>();
</script>

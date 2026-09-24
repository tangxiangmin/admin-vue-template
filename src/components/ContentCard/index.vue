<template>
  <section class="ui-panel p-md sm:p-lg">
    <header
      v-if="title || description || $slots.actions"
      class="ui-between items-start mb-lg"
    >
      <div>
        <h2
          v-if="title"
          class="m-0 text-lg font-semibold leading-normal"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="ui-description mt-xs"
        >
          {{ description }}
        </p>
      </div>
      <slot name="actions" />
    </header>
    <div
      class="ui-stack items-stretch [&>*]:min-w-0 [&>.el-text]:self-stretch [&>.el-text]:m-0 [&>.el-text]:break-words"
    >
      <slot />
    </div>
  </section>
</template>
<script setup lang="ts">
defineProps<{ title?: string; description?: string }>();
</script>

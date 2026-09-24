<template>
  <code
    v-if="inline"
    class="ui-code px-xs py-1"
  >
    <slot />
  </code>
  <pre
    v-else
    class="ui-code m-0 p-md overflow-auto whitespace-pre-wrap break-words"
  ><code><slot /></code></pre>
</template>
<script setup lang="ts">
defineProps<{ inline?: boolean }>();
</script>

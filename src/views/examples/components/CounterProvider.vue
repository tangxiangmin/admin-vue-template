<template>
  <ContentCard :title="title">
    <CounterControls label="子组件 A" />
    <CounterControls label="子组件 B" />
  </ContentCard>
</template>
<script setup lang="ts">
import ContentCard from "@/components/ContentCard/index.vue";
import { useProvideExampleCounter } from "../useExampleCounter";
import CounterControls from "./CounterControls.vue";
const props = defineProps<{ title: string; initial: number }>();
useProvideExampleCounter(props.initial);
</script>

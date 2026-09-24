<template>
  <div class="ui-row">
    <span>{{ label }}</span>
    <strong>{{ count }}</strong>
    <el-button-group>
      <el-button
        :disabled="count === 0"
        aria-label="减一"
        @click="dec()"
      >
        −
      </el-button>
      <el-button
        :disabled="count === 99"
        aria-label="加一"
        @click="inc()"
      >
        +
      </el-button>
      <el-button @click="reset()">重置</el-button>
    </el-button-group>
  </div>
</template>
<script setup lang="ts">
import { useExampleCounter } from "../useExampleCounter";
defineProps<{ label: string }>();
const { count, inc, dec, reset } = useExampleCounter();
</script>

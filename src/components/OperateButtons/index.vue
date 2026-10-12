<template>
  <div
    class="ui-row"
    @click.stop
  >
    <template
      v-for="item in direct"
      :key="item.key"
    >
      <el-popover
        v-if="item.children?.length"
        placement="bottom-end"
        trigger="click"
        width="220"
        :disabled="item.disabled"
      >
        <template #reference>
          <el-button
            link
            :disabled="item.disabled"
            :aria-label="item.label"
          >
            <i
              v-if="item.icon"
              :class="item.icon"
            />
            <span v-else>{{ item.label }}</span>
          </el-button>
        </template>
        <el-menu class="operation-menu">
          <OperationMenuItem
            v-for="child in item.children"
            :key="child.key"
            :item="child"
          />
        </el-menu>
      </el-popover>
      <el-tooltip
        v-else
        :content="item.label"
      >
        <el-button
          link
          :type="item.danger ? 'danger' : 'primary'"
          :disabled="item.disabled"
          :aria-label="item.label"
          @click="item.run?.()"
        >
          <i
            v-if="item.icon"
            :class="item.icon"
          />
          <span v-else>{{ item.label }}</span>
        </el-button>
      </el-tooltip>
    </template>
    <el-popover
      v-if="overflow.length"
      placement="bottom-end"
      trigger="click"
      width="220"
    >
      <template #reference>
        <el-button
          link
          aria-label="更多操作"
        >
          <i class="i-ep-more-filled" />
        </el-button>
      </template>
      <el-menu class="operation-menu">
        <OperationMenuItem
          v-for="item in overflow"
          :key="item.key"
          :item="item"
        />
      </el-menu>
    </el-popover>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { IOperation } from "@/typings/operation";
import OperationMenuItem from "./OperationMenuItem.vue";
const props = withDefaults(defineProps<{ items: IOperation[]; breakLength?: number }>(), { breakLength: 2 });
const visible = computed(() => props.items.filter(item => item.show !== false));
const direct = computed(() => visible.value.slice(0, props.breakLength));
const overflow = computed(() => visible.value.slice(props.breakLength));
</script>
<style scoped>
.operation-menu {
  border-right: 0;
}
</style>

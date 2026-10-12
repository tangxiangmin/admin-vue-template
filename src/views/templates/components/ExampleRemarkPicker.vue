<template>
  <div class="ui-stack">
    <p class="text-sm text-ui-muted">选择后点击应用，返回原表单继续编辑。</p>
    <el-radio-group
      v-model="selected"
      class="ui-stack items-start"
    >
      <el-radio
        v-for="item in remarks"
        :key="item"
        :value="item"
      >
        {{ item }}
      </el-radio>
    </el-radio-group>
    <el-button
      type="primary"
      :disabled="!selected"
      @click="apply"
    >
      应用备注
    </el-button>
  </div>
</template>
<script setup lang="ts">
import { onScopeDispose, ref } from "vue";
import type { IFormLeaveEntry } from "@/typings/crud";
interface IPickerActions {
  close: () => void | Promise<void>;
  registerLeave: (entry: IFormLeaveEntry) => () => void;
}
const props = defineProps<{ applyValue: (value: string) => void; actions: IPickerActions }>();
const remarks = ["待业务确认", "资料已补齐", "定期复核"];
const selected = ref("");
let applied = false;
const unregister = props.actions.registerLeave({ isDirty: () => !applied && Boolean(selected.value) });
onScopeDispose(unregister);
function apply() {
  props.applyValue(selected.value);
  applied = true;
  props.actions.close();
}
</script>

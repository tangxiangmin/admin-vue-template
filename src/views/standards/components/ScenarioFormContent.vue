<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    label-position="top"
    :disabled="disabled"
    @input="emit('touch')"
    @change="emit('touch')"
    @submit.prevent
  >
    <div v-show="section !== 'remark'">
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="model.name"
          maxlength="80"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-switch
          v-model="model.status"
          :active-value="1"
          :inactive-value="0"
          @change="emit('touch')"
        />
      </el-form-item>
    </div>
    <div v-show="section !== 'base'">
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="model.remark"
          type="textarea"
          :rows="4"
          maxlength="300"
        />
      </el-form-item>
      <el-form-item
        v-if="model.status === 0"
        label="停用原因"
        prop="reason"
      >
        <el-input
          v-model="model.reason"
          maxlength="100"
        />
      </el-form-item>
    </div>
  </el-form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
interface IScenarioModel {
  name: string;
  status: number;
  remark: string;
  reason: string;
}
const props = defineProps<{ model: IScenarioModel; disabled: boolean; section?: "base" | "remark" }>();
const emit = defineEmits<{ touch: [] }>();
const formRef = ref<FormInstance>();
const rules: FormRules = {
  name: [{ required: true, whitespace: true, message: "请输入名称", trigger: "blur" }],
  reason: [
    {
      validator: (_rule, value, callback) => {
        callback(props.model.status === 0 && !String(value ?? "").trim() ? new Error("请输入停用原因") : undefined);
      },
      trigger: "blur"
    }
  ]
};
defineExpose({
  validate: async (section?: "base") => {
    if (!formRef.value) return false;
    return (section ? formRef.value.validateField(["name", "status"]) : formRef.value.validate()).catch(() => false);
  }
});
</script>

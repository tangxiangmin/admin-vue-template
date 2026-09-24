<template>
  <el-form
    ref="loginFormRef"
    :model="loginForm"
    :rules="loginRules"
    :disabled="loading"
    label-position="top"
    @submit.prevent="login(loginFormRef)"
  >
    <el-form-item
      prop="username"
      label="账号"
    >
      <el-input
        v-model="loginForm.username"
        :placeholder="TEMPLATE_DEMO ? 'admin / user' : '请输入账号'"
        autocomplete="username"
      >
        <template #prefix><i class="i-ep-user" /></template>
      </el-input>
    </el-form-item>
    <el-form-item
      prop="password"
      label="密码"
    >
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="请输入密码"
        show-password
        autocomplete="current-password"
      >
        <template #prefix><i class="i-ep-lock" /></template>
      </el-input>
    </el-form-item>
    <el-button
      class="w-full mt-md"
      type="primary"
      native-type="submit"
      :loading="loading"
    >
      {{ loading ? "正在登录…" : "登录工作台" }}
      <i class="i-ep-right ml-xs" />
    </el-button>
    <div class="ui-between mt-md">
      <el-text
        type="info"
        size="small"
      >
        使用管理员分配的账号登录
      </el-text>
      <el-button
        text
        :disabled="loading"
        @click="resetForm(loginFormRef)"
      >
        清空输入
      </el-button>
    </div>
  </el-form>
  <el-alert
    v-if="TEMPLATE_DEMO"
    title="演示账号"
    description="账号：admin（管理）或 user（只读）；密码均为 123456。数据刷新后恢复。"
    type="info"
    :closable="false"
    class="mt-lg"
  />
</template>

<script setup lang="ts">
import type { ElForm } from "element-plus";
import { ElMessage } from "element-plus";
import { TEMPLATE_DEMO } from "@/config/template";
import md5 from "md5";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import type { ILoginParams } from "@/typings/api";
import { loginApi } from "@/api/modules/login";
import { HOME_URL } from "@/config";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { useTabsStore } from "@/stores/modules/tabs";
import { useUserStore } from "@/stores/modules/user";

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();

type TFormInstance = InstanceType<typeof ElForm>;
const loginFormRef = ref<TFormInstance>();
const loginRules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
});

const loading = ref(false);
const loginForm = reactive<ILoginParams>({
  username: "",
  password: ""
});

// 原有认证协议保持不变，提交仅由表单触发。
const login = async (formEl: TFormInstance | undefined) => {
  if (!formEl || loading.value) return;
  loading.value = true;
  try {
    const valid = await formEl.validate().catch(() => false);
    if (!valid) return;
    const { data } = await loginApi({ ...loginForm, password: md5(loginForm.password) });
    userStore.setToken(data.access_token);
    userStore.setUserInfo({ name: loginForm.username });
    tabsStore.setTabs([]);
    keepAliveStore.setKeepAliveName([]);
    await router.push(HOME_URL);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "登录失败");
  } finally {
    loading.value = false;
  }
};

// resetForm
const resetForm = (formEl: TFormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>

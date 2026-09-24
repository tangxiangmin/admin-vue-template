<template>
  <div class="workspace-account flex items-center gap-xs min-w-0">
    <span
      class="account-avatar grid place-items-center w-8 h-8 shrink-0 rounded-md bg-ui-soft text-ui-accent text-md font-semibold"
      :title="user.userInfo.name"
    >
      {{ user.userInfo.name.slice(0, 1).toUpperCase() }}
    </span>
    <div
      class="account-name text-md max-w-filter truncate text-ui-text"
      :title="user.userInfo.name"
    >
      {{ user.userInfo.name }}
    </div>
    <button
      type="button"
      class="ui-icon-button"
      aria-label="退出登录"
      title="退出登录"
      @click="logout"
    >
      <i class="i-ep-switch-button" />
    </button>
  </div>
</template>
<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { logoutApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
const user = useUserStore();
const router = useRouter();
async function logout() {
  try {
    await ElMessageBox.confirm("确认退出当前账号？", "退出登录", {
      confirmButtonText: "退出",
      cancelButtonText: "取消"
    });
  } catch {
    return;
  }
  try {
    await logoutApi();
    user.setToken("");
    await router.replace("/login");
  } catch {
    ElMessage.error("退出失败，请重试");
  }
}
</script>

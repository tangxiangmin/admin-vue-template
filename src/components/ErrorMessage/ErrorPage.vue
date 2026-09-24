<template>
  <main class="min-h-screen box-border bg-ui-canvas p-md sm:p-xl flex flex-col gap-lg">
    <header class="ui-between w-full max-w-page mx-auto">
      <Brand />
      <SwitchDark />
    </header>
    <section class="flex-1 grid lg:grid-cols-2 items-center gap-xl w-full max-w-error mx-auto py-xl">
      <SceneIllustration
        :scene="code"
        class="max-w-illustration mx-auto"
      />
      <div class="ui-stack items-start">
        <span class="text-4xl font-semibold text-ui-accent">{{ code }}</span>
        <h1 class="m-0 text-2xl font-semibold text-ui-text">{{ content.title }}</h1>
        <p class="ui-description">{{ content.description }}</p>
        <div class="ui-row mt-md">
          <el-button
            type="primary"
            @click="router.replace(HOME_URL)"
          >
            返回工作台
          </el-button>
          <el-button @click="goBack">返回上一页</el-button>
        </div>
        <p class="m-0 text-sm text-ui-muted">{{ content.hint }}</p>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { HOME_URL } from "@/config";
import Brand from "@/layouts/components/Workbench/Brand.vue";
import SwitchDark from "@/components/SwitchDark/index.vue";
import SceneIllustration from "@/components/SceneIllustration/index.vue";
const props = defineProps<{ code: "403" | "404" | "500" }>();
const router = useRouter();
const messages = {
  "403": {
    title: "暂时无法访问此页面",
    description: "当前账号没有访问权限。你可以返回工作台，或联系管理员确认角色与权限配置。",
    hint: "如权限刚刚变更，请重新登录后再试。"
  },
  "404": {
    title: "这个页面暂时找不到了",
    description: "访问地址可能有误，或者页面已被移动。请检查链接，也可以从工作台重新进入。",
    hint: "已打开的其他页面不受影响。"
  },
  "500": {
    title: "服务暂时未能完成请求",
    description: "页面或服务加载出现异常。请稍后从工作台重试；如果问题持续，请联系管理员。",
    hint: "反馈时请提供访问路径与发生时间，便于定位问题。"
  }
};
const content = computed(() => messages[props.code]);
function goBack() {
  if (typeof router.options.history.state.back === "string") router.back();
  else void router.replace(HOME_URL);
}
</script>

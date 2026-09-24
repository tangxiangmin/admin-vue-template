<template>
  <main class="min-h-screen box-border bg-ui-canvas p-md sm:p-xl flex flex-col gap-lg">
    <header class="ui-between w-full max-w-page mx-auto">
      <Brand />
      <div class="ui-row">
        <span class="hidden sm:inline text-sm text-ui-muted">管理工作，从这里开始</span>
        <SwitchDark />
      </div>
    </header>
    <div class="flex-1 grid lg:grid-cols-2 items-center gap-xl w-full max-w-page mx-auto py-lg">
      <section class="hidden lg:flex flex-col items-start gap-lg px-xl">
        <div class="ui-row text-sm text-ui-accent">
          <span class="w-2 h-2 rounded-full bg-ui-accent" />
          团队与业务的统一入口
        </div>
        <h1 class="m-0 text-4xl leading-snug font-semibold text-ui-text">
          让管理更清晰，
          <br />
          让工作更从容。
        </h1>
        <p class="ui-description max-w-form">连接团队、权限与业务，把日常操作收纳在一个有序的工作空间。</p>
        <SceneIllustration
          scene="login"
          class="max-w-illustration self-center"
        />
        <div class="ui-row text-sm text-ui-muted">
          <span class="ui-row">
            <i class="i-ep-lock text-ui-accent" />
            权限有序
          </span>
          <span class="ui-row">
            <i class="i-ep-grid text-ui-accent" />
            业务协同
          </span>
          <span class="ui-row">
            <i class="i-ep-setting text-ui-accent" />
            按需定制
          </span>
        </div>
      </section>
      <section class="w-full max-w-login mx-auto ui-panel p-lg sm:p-xl box-border">
        <div
          class="inline-grid place-items-center w-control-large h-control-large rounded-lg bg-ui-soft text-ui-accent text-xl mb-lg"
        >
          <i class="i-ep-right" />
        </div>
        <h2 class="m-0 text-2xl font-semibold text-ui-text">欢迎回来</h2>
        <p class="ui-description mt-xs mb-xl">登录你的账号，继续今天的工作。</p>
        <LoginForm />
      </section>
    </div>
    <div class="text-center text-xs text-ui-muted">管理后台模板</div>
  </main>
</template>
<script setup lang="ts" name="login">
import SwitchDark from "@/components/SwitchDark/index.vue";
import SceneIllustration from "@/components/SceneIllustration/index.vue";
import Brand from "@/layouts/components/Workbench/Brand.vue";
import LoginForm from "./components/LoginForm.vue";
</script>

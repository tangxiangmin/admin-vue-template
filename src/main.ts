import { createApp } from "vue";

// element css
import "element-plus/dist/index.css";
// element dark css
import "element-plus/theme-chalk/dark/css-vars.css";
// custom styles
import "@/styles/index.scss";
// unocss（原子化样式 + iconify 图标）
import "virtual:uno.css";

import ElementPlus from "element-plus";

// vue Router
import router from "@/routers";
// pinia store
import pinia from "@/stores";
import App from "./App.vue";
import http, { customErrorService } from "@/api";
import { TEMPLATE_DEMO } from "@/config/template";
import { initRequest } from "@/utils/request";

const app = createApp(App);

// 代码异常保留原始错误及堆栈，业务提示由请求和页面操作处理。
app.config.errorHandler = (error, instance, info) => {
  console.error("Vue 运行时错误", error, { component: instance?.$options.name, info });
};

async function bootstrap() {
  app.use(ElementPlus).use(pinia);
  initRequest();
  if (TEMPLATE_DEMO) {
    const { installDemo } = await import("@/demo");
    installDemo([http, customErrorService]);
  }
  app.use(router).mount("#app");
}

void bootstrap();

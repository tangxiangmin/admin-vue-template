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
import { ElNotification } from "element-plus";

// vue Router
import router from "@/routers";
// pinia store
import pinia from "@/stores";
import App from "./App.vue";
import http, { customErrorService } from "@/api";
import { TEMPLATE_DEMO } from "@/config/template";
import { initRequest } from "@/utils/request";

// 全局代码错误捕捉
const errorHandler = (error: any) => {
  // 过滤 HTTP 请求错误
  if (error.status || error.status === 0) return false;
  const errorMap: { [key: string]: string } = {
    InternalError: "Javascript引擎内部错误",
    ReferenceError: "未找到对象",
    TypeError: "使用了错误的类型或对象",
    RangeError: "使用内置对象时，参数超范围",
    SyntaxError: "语法错误",
    EvalError: "错误的使用了Eval",
    URIError: "URI错误"
  };
  const errorName = errorMap[error.name] || "未知错误";
  ElNotification({
    title: errorName,
    message: error,
    type: "error",
    duration: 3000
  });
};

const app = createApp(App);

app.config.errorHandler = errorHandler;

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

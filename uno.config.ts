import { defineConfig, presetIcons, presetUno } from "unocss";
import { icons as epIcons } from "@iconify-json/ep";

import { UI_CSS, UI_UNO_THEME } from "./src/config/ui";

export default defineConfig({
  theme: UI_UNO_THEME,
  preflights: [{ getCSS: () => UI_CSS }],
  // 默认只扫描 vue/jsx/html 等文件，这里补充 .ts（业务路由的图标 token 定义在 ts 中）
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html|ts)($|\?)/]
    }
  },
  presets: [
    // 原子化 CSS 工具类（w-4、flex、text-sm 等）
    presetUno(),
    // Iconify 图标，使用方式：<i class="i-ep-setting" />
    // 图标集：https://icones.js.org（本项目安装了 @iconify-json/ep，Element Plus 图标）
    presetIcons({
      collections: { ep: () => epIcons },
      warn: true,
      autoInstall: false,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle"
      }
    })
  ],
  // 自定义 shortcuts（按需追加）
  shortcuts: {
    "ui-row": "flex flex-wrap items-center gap-sm [&>.el-button]:m-0",
    "ui-between": "ui-row justify-between",
    "ui-stack": "flex flex-col gap-md min-w-0",
    "ui-panel": "min-w-0 border border-solid border-ui-border rounded-lg bg-ui-surface",
    "ui-icon-button":
      "grid place-items-center shrink-0 w-control h-control p-0 border-0 rounded-md bg-transparent text-ui-muted text-lg cursor-pointer hover:bg-ui-soft hover:text-ui-text",
    "ui-description": "m-0 text-md text-ui-muted leading-relaxed",
    "ui-code":
      "font-mono text-xs leading-relaxed text-ui-regular bg-ui-canvas border border-solid border-ui-border rounded-md"
  }
});

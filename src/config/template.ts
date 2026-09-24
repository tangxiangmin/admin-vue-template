// 开发环境默认启用；生产环境需显式开启。
export const TEMPLATE_DEMO =
  import.meta.env.VITE_TEMPLATE_DEMO === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_TEMPLATE_DEMO !== "false");

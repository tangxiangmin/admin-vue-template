// 演示模式只在本地开发启用；生产构建始终使用真实接口。
export const TEMPLATE_DEMO = import.meta.env.DEV && import.meta.env.VITE_TEMPLATE_DEMO !== "false";

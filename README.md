# 管理后台模板

fork自[Geeker-Admin](https://github.com/HalseySpicy/Geeker-Admin)，修改整体样式风格和项目技术选型，用于现代 vide coding 的管理后台模板。

用于本地管理后台开发，基于 Vue 3、TypeScript、Vite、Pinia 和 Element Plus。

提供布局与主题配置、菜单与按钮权限、角色及管理员管理、CRUD 页面模板和工具示例。

开发环境使用 Node.js 22、pnpm 9。依赖准备完成后执行 `pnpm dev`；生产构建命令为 `pnpm build:pro`。

本地演示在开发模式默认启用，数据位于 `src/demo`，刷新后恢复。演示账号为 `admin` / `user`，密码均为 `123456`。

接入真实后端时，在 `.env.development.local` 配置 `VITE_TEMPLATE_DEMO=false`，并设置 `VITE_PROXY` 或 `VITE_API_URL`。默认接口基址为同源 `/api`。

开发约定见 [后台模板规范](docs/admin-template.md)、[UI 规范](docs/ui-guidelines.md)、[状态与工具规范](docs/state-and-utilities.md)和[图表规范](docs/charts.md)。授权声明见 [LICENSE](LICENSE)。

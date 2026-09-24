# 后台模板规范

## 实现来源与边界

本项目作为本地管理后台开发模板，提供布局切换、主题色、暗色模式、标签页、面包屑、权限点、角色、管理员及 CRUD 流程，使用 Vue 3、Pinia 和 Element Plus。授权声明见 LICENSE。

| 能力         | 入口                 | 职责                                   |
| ------------ | -------------------- | -------------------------------------- |
| 权限点       | `/system/privileges` | 维护权限名称、唯一编码、类型和关联路径 |
| 角色         | `/system/roles`      | 维护角色与权限 ID 的关联               |
| 管理员       | `/system/users`      | 新增账号及分配角色；编辑不提交密码     |
| CRUD 示例    | `/templates/crud`    | 查询、分页、新增、编辑、删除           |
| 基础布局示例 | `/menu`              | 保留原菜单嵌套示例                     |

权限演示由实际权限管理页面提供。未迁移健身业务、微信、支付、编辑器和部署脚本。

## 演示模式与接口接入

请求层采用 Axios 实例和拦截器，`src/api/index.ts` 提供默认实例与页面自行提示错误的 `customErrorService`，业务失败均拒绝 Promise；`src/utils/request.ts` 在应用启动时注入错误提示和登录失效处理。HTTP 401 和业务码 401 清除当前失效会话并跳转登录，不自动重放请求。上传使用 FormData，下载通过 `responseType: "blob"` 返回 Blob；loading 由页面管理，请求取消使用 Axios 的 `signal`。

演示数据、登录校验和本地接口 adapter 位于 `src/demo`，在启动时仅向演示模式注入；API 模块统一走 Axios，不包含演示分支。未实现的演示接口返回错误，不发送真实网络请求。

使用已有依赖执行 `pnpm dev`。`src/config/template.ts` 在 Vite 开发模式默认启用演示；`.env.production` 为在线预览显式开启演示。接入真实服务时，将 `VITE_TEMPLATE_DEMO` 设为 `false`（生产构建需覆盖 `.env.production` 的设置），并配置 `VITE_PROXY` 或 `VITE_API_URL` 指向业务后端。默认接口基址为同源 `/api`，无外部 Mock 代理。演示数据仅内存保存，刷新恢复；不保存新增管理员的密码。账号 `admin`、`user` 的登录密码均为 `123456`；只有这两个内置账号可以演示登录。角色变更会影响对应演示账号的权限，移除自身权限后可刷新恢复。

真实服务接入位置：

- `src/api/modules/login.ts`：使用 `/login`、`/logout` 路径，登录响应为 `data.access_token`。现有表单使用 MD5 后发送密码，接入业务前须与服务端协商认证协议；MD5 不能替代 HTTPS 和服务端密码安全存储。
- `src/api/index.ts`：已有 `VITE_API_URL`、`x-access-token` 和响应 envelope 处理。
- `src/api/modules/permission.ts`：权限接口适配，来源为参考项目的 `/privilege/admin`、`/role/admin`、`/user/admin` 下的 `listByPage`、`add`、`edit`。管理员列表携带 `userType: 1`。
- 当前用户权限：`GET /user/admin/userInfo`，消费 `data.privilegeList[].privilegeKey`。生产服务必须提供该接口或修改适配器。
- 列表请求为 `{ pageNum, pageSize, keyword }`；列表结果为 `{ list, total }`。`keyword` 为模板新增统一查询字段，接入原服务时按实际字段映射，不能假定原接口已支持。
- 角色返回的 `privilegeList` 转换为 `privilegeIdList`；管理员返回的角色对象数组转换为 `roleList: number[]`。原接口与当前项目响应码、token 协议的兼容性需要联调。
- 权限与角色的下拉选项逐页获取；后端应允许拥有分配权限的用户读取必要的选项数据。
- 权限管理没有删除接口。CRUD 示例的删除操作仅用于本地示例；服务模式会明确提示未接入 API，不伪造成功。

当前仓库没有配套业务后端；生产权限、角色和管理员接口尚未联调。

## 权限约定

权限编码采用 `模块.资源.操作`，例如 `permission.role.view`、`permission.role.edit`。路由的 `meta.permission` 声明查看权限；静态路由保留注册，菜单按权限过滤，路由守卫拦截直接 URL 访问。无权限返回 403，权限初始化失败返回 500。无权限列表默认拒绝受保护操作。

`useAuthStore().hasPermission(key)` 为统一判断入口；数组表示全部满足。`usePermission` 返回响应式判断供模板 `v-if` 使用。页面使用 `usePermission` 和完整权限编码。前端权限只控制 UI 和导航，服务端必须独立校验每次读取和写入。

权限不持久化，token 变化时清空。真实接口模式登录后首次导航拉取权限，角色修改后需重新登录或刷新重新获取；演示模式根据内存中的用户、角色和权限关系实时计算。新增路由必须在后端权限目录登记对应编码。不要添加开发模式权限绕过，不要通过用户名判断真实管理员权限。

## UI 规范

完整规则见 [UI 配置与页面开发规范](./ui-guidelines.md)。统一配置位于 `src/config/ui.ts`，UnoCSS、Element Plus Provider、CSS 变量和图表使用同一来源。基础字号默认 16px，可在界面设置中调整并持久化。

- 页面使用 PageContainer、ContentCard、PageGrid；业务列表使用 CrudPage。字号采用 text-xs / text-sm / text-md 等语义类，间距和尺寸也使用共享 token。
- 四种布局共用 Workbench，保留主题、菜单折叠、手风琴、面包屑和标签页；每种布局仅有一个账号入口。布局尺寸与断点来自 UI_CONFIG。
- 菜单弹层使用 workspace-menu-popper 共享配色、圆角、字号与选中态。复杂网格和 Element Plus 内部覆盖保留在布局或适配层。
- 列表按“页面标题及新增按钮—环境提示—数据卡片”组织，查询、刷新、表格和分页位于同一卡片。列宽通过 useUiTokens 的语义列宽生成。
- 新增使用 primary；编辑使用 primary link，删除使用 danger link；权限编码使用 CodeBlock inline，状态使用文字 Tag。
- 默认分页 20 条，可选 10/20/50/100；编辑弹窗使用共享 dialog 尺寸，并限制在视口范围内。
- 首页只展示实际权限允许的入口和可访问页面数。页面不再使用装饰性英文标签。
- 页面搜索支持 ⌘/Ctrl K，仅显示可访问页面；图标按钮提供 aria-label，保留焦点样式与 reduced-motion 支持。
- 登录页与工作台共享主题。

## 交互规范

- 查询、重置、切换每页条数回到第一页；翻页保留已提交筛选值。输入关键词后点击查询或回车生效。
- 列表 loading、空列表、失败提示分别呈现；失败显示重试入口。并发查询只有最后一次响应可以覆盖列表。
- 新增使用工厂创建独立初值，编辑复制记录，取消不改变列表。保存前校验，保存中禁用重复提交和关闭。
- 保存失败保留输入和弹窗，成功后关闭并刷新列表；刷新失败在列表区提示，可单独重试。
- 表单存在变更时关闭弹窗或离开路由需确认。浏览器直接刷新/关闭标签不在当前防丢实现范围内。
- 删除确认显示记录名称，取消不产生错误提示。删除后当前页超出总页数时回到最后有效页。
- 关联选项加载失败时禁止新增、编辑及保存，提供重试；已有关系不得因选项请求失败被清空。
- 权限点和角色编码创建后禁改；管理员用户名创建后禁改。密码不在列表展示，编辑账号不包含密码重置。

## 开发职责与扩展步骤

`src/typings` 定义跨模块数据契约；`src/api/modules` 适配接口字段；`src/hooks/useCrud.ts` 管理数据状态与增删改流程；`src/components/CrudPage/index.vue` 组合列表布局、校验与弹窗；页面通过 columns/form 插槽声明业务字段。复杂业务规则留在业务模块中。

新增模块：

1. 参考 `src/views/templates/crud.vue` 建立业务页面，类型命名使用 `I` 开头的 interface、`T` 开头的 type。
2. 在 API 模块实现 `ICrudApi<T>`。列表返回 `{ list, total }`，新增和编辑在失败时抛错；未实现删除时省略 `remove`。
3. 提供 `createRow`、`rowLabel`、表单规则及列/字段插槽。名称与唯一编码的服务端校验必须保留。
4. 在 `src/routers/modules/business.ts` 显式注册懒加载路由，设置唯一 name 和 `meta.permission`。
5. 登记 view/add/edit/remove 权限，分配给角色；未提供的动作不显示按钮。
6. 本地演示需要数据时在演示模块中增加对应实现，真实模式通过业务 API 适配，不复制旧项目网络或部署配置。

模块只导出实际调用的符号，禁止 `export *`；模块内部类型和工具默认私有。不要在页面中直接发送 HTTP 请求或复制另一套权限判断。新功能显式导入 Vue API，不依赖参考项目的 auto-import 插件。

所有制品保持本地。不自动安装依赖、不自动提交、不生成测试文件；修改超过 3 个文件先列变更计划。检查、构建和格式化按用户指令执行。

## 状态工具与示例

参见 [状态与工具使用规范](./state-and-utilities.md)。基础响应式能力使用 Vue 与 VueUse；应用级业务状态使用 Pinia；组件树共享状态使用 createInjectionState。路由搜索记录使用 `src/hooks/useRouteSearchRecord.ts`，命令式 JSON 存储使用 `src/utils/storage.ts`，不复制旧项目的 any 类型与全局存储单例。

工具示例统一放在 `src/views/examples`，通过“工具示例”菜单访问。包含路由搜索记录、存储模型、VueUse 快捷用法、G2Plot 图表和 UI 组件规范页面，展示本地交互和关键调用片段。CRUD 业务模板仍位于 `src/views/templates/crud.vue`。

## 待人工验收

本次实现未执行构建、类型检查和单元测试。视觉改造尝试使用本地浏览器预览，但当前工具未提供可用浏览器，尚未完成截图与浏览器验收。建议验收：两个演示账号登录与切换；直达未授权路由；角色授权后菜单和按钮变化；新增/编辑取消与校验；搜索和分页；删除末页唯一记录；选项与列表请求失败；暗色主题和窄屏；生产接口的登录、权限与增删改链路。

## 图表开发

环境统一为 Node.js 22、pnpm 9。图表使用 AntV G2Plot，示例位于 `src/views/examples/charts.vue`，详见 [图表开发规范](./charts.md)。

## 代码检查与格式化

使用 Oxlint 检查 JavaScript、TypeScript 和 Vue 脚本，使用 Oxfmt 格式化源码及 Vue 模板。Vue 模板类型检查由 vue-tsc 完成。

- `pnpm lint`：检查代码，不写入文件。
- `pnpm lint:fix`：应用 Oxlint 支持的修复。
- `pnpm format`：使用 Oxfmt 格式化，Vue 多属性标签按行展开。
- `pnpm check`：依次执行 lint、类型检查和格式检查。

编辑器使用 Oxc 扩展，工作区已配置保存时格式化。CSS、SCSS 和 Vue 样式由 Oxfmt 格式化，Stylelint 已停用。

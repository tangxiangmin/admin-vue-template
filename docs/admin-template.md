# 后台模板规范

## 实现来源与边界

本项目作为本地管理后台开发模板，提供布局切换、主题色、暗色模式、标签页、面包屑、权限点、角色、管理员及 CRUD 流程，使用 Vue 3、Pinia 和 Element Plus。授权声明见 LICENSE。

| 能力         | 入口                     | 职责                                   |
| ------------ | ------------------------ | -------------------------------------- |
| 权限点       | `/system/privileges`     | 维护权限名称、唯一编码、类型和关联路径 |
| 角色         | `/system/roles`          | 维护角色与权限 ID 的关联               |
| 管理员       | `/system/users`          | 新增账号及分配角色；编辑不提交密码     |
| CRUD 示例    | `/templates/crud`        | 查询、分页、新增、编辑弹窗和删除       |
| 抽屉交互模板 | `/templates/crud-drawer` | 详情、编辑、复制、选择器叠层及表单挽留 |
| 表单挽留示例 | `/examples/form-leave`   | 页面编辑、弹窗、抽屉及关闭、离开保护   |
| 基础布局示例 | `/menu`                  | 保留原菜单嵌套示例                     |

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
- 默认分页 20 条，可选 10/20/50/100；基础 CRUD 使用 dialog 尺寸的编辑弹窗。抽屉示例使用 detail-drawer/form-drawer 尺寸，窄屏全宽。
- 首页只展示实际权限允许的入口和可访问页面数。页面不再使用装饰性英文标签。
- 页面搜索支持 ⌘/Ctrl K，仅显示可访问页面；图标按钮提供 aria-label，保留焦点样式与 reduced-motion 支持。
- 登录页与工作台共享主题。

## 交互规范

- 查询、重置、切换每页条数回到第一页；翻页保留已提交筛选值。输入关键词后点击查询或回车生效。
- 两套 CRUD 通过 `searchStoreOptions` 配置搜索持久化，默认 `url`。记录已提交关键词、页码及每页条数，恢复后自动查询；输入草稿不自动保存。URL 查询态使用 `__query_state__` 参数，指定 key 时使用 `__query_state__:key`；其余业务 query、hash 和抽屉深链保留。工作标签、页面缓存及离开保护忽略查询态，标签返回地址保留查询态。
- 列表 loading、空列表、失败提示分别呈现；失败显示重试入口。并发查询只有最后一次响应可以覆盖列表。
- 新增使用工厂创建独立初值，编辑复制记录，取消不改变列表。保存前校验，保存中禁用重复提交和关闭。
- 基础 CRUD 保存失败保留输入和弹窗，成功后关闭并刷新列表；抽屉示例保存成功后返回上层，详情内编辑后同步下层详情。列表刷新失败在列表区提示，可单独重试。
- 表单与初始快照不同才视为未保存；接口回填不产生脏态，改回原值不提示。
- 关闭、返回列表、换记录、路由离开、工作页签关闭及刷新统一进行挽留；多个受影响表单只弹一次确认。取消不删除页签或缓存。
- 浏览器刷新和关闭通过 beforeunload 使用原生提示。保存及详情查询期间阻止销毁页面的操作。
- 详情内编辑和自定义选择器使用同一抽屉栈，每层使用独立 el-drawer。切换时当前层退出与新栈顶进入并行，关闭顶层时上一层同步进入。退出中的抽屉禁用交互，下层保持挂载与输入，窄屏全宽；打开选择器保留原表单输入。
- 抽屉不使用遮罩，列表仍可点击切换记录；关闭按钮和 Esc 经过统一保护。
- 工作标签支持右键菜单，操作目标为被右键的标签，不提前切换路由；菜单在鼠标位置展开。右侧下拉按钮保留，两处共用菜单与操作 Hook。关闭左侧、右侧、其它及所有时保护固定标签，并沿用统一挽留；刷新和最大化在成功切换到目标页面后执行。
- 搜索状态使用路由 replace，不增加历史记录；可用 `?drawer=detail&id=1`、`?drawer=edit&id=1`、`?drawer=add` 进入抽屉。详情及编辑深链需要 getDetail；抽屉参数和搜索状态不参与页签和缓存标识，其余业务 query/hash 保留。
- 删除确认显示记录名称，取消不产生错误提示。删除后当前页超出总页数时回到最后有效页。
- 关联选项加载失败时禁止新增、编辑及保存，提供重试；已有关系不得因选项请求失败被清空。
- 权限点和角色编码创建后禁改；管理员用户名创建后禁改。密码不在列表展示，编辑账号不包含密码重置。

## 开发职责与扩展步骤

`src/typings` 定义跨模块数据契约；`src/api/modules` 适配接口字段；`useCrud` 管理列表和写入请求；`useCrudDialog` 管理基础 CRUD 编辑弹窗；`useDrawerStack` 管理层级；`useCrudDrawer` 编排 CRUD、详情同步及深链；`useFormLeaveGuard` 管理每层表单的离开源；`pageLeave` Pinia 模块协调页面、页签和局部关闭确认，不持久化回调。`DrawerStack` 为每层渲染独立抽屉，保留下层实例，出栈动画结束后卸载对应层，`CrudPage` 组合基础列表和编辑弹窗；`CrudDrawerPage` 组合列表、详情和抽屉栈。复杂业务规则留在业务模块中。

基础页面使用 CrudPage 的 columns/form 插槽；抽屉页面使用 CrudDrawerPage 的 columns/form/detail 插槽。自定义叠层通过 form 插槽的 `actions.openRoute(name, params)` 打开，在 drawer 插槽按 route 渲染。自定义表单通过 `actions.registerLeave({ isDirty, isBlocked? })` 注册离开源，返回注销函数，组件在 onScopeDispose 调用；`actions.close()` 请求关闭当前层。备注选择器示例位于 `src/views/templates/components/ExampleRemarkPicker.vue`。复制新增由页面的 copyRow 清除主键并创建业务初值。

ICrudApi 可选 `getDetail(id)` 用于查询完整记录及保存后的详情刷新。未配置时，详情展示列表字段，保存后从当前页列表同步；管理员、角色和权限页面继续使用基础编辑弹窗，未接入详情抽屉或增加假定接口。两个示例分别使用独立的内存数据，互不影响。

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

### CRUD 搜索持久化

`useSearchStore` 负责读取、校验和保存查询态，`useCrud` 负责恢复表单与分页并请求列表。配置类型位于 `src/typings/search.ts`，`CrudPage` 与 `CrudDrawerPage` 均接收 `searchStoreOptions`：

| 配置                                        | 行为                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| 省略或 `{ type: 'url' }`                    | 查询态以 base64url 编码写入 URL；刷新或复制链接可恢复                 |
| `{ type: 'url', key: 'orders' }`            | 使用独立的 `__query_state__:orders` 参数，供同页多列表区分            |
| `{ type: 'sessionStorage', key: 'orders' }` | 按当前账号、页面及 key 保存；同一浏览器标签页会话内保留，刷新仍可恢复 |
| `{ type: 'memory', key: 'picker' }`         | 同一 pathname 内跨组件重挂载保留；切换 pathname 或刷新清空            |
| `{ type: 'none' }`                          | 不写入存储，组件卸载后丢失                                            |

`__query_state__` 和 `__query_state__:` 前缀为搜索状态保留命名空间，不用于业务页面身份。损坏或不符合结构的状态恢复为默认值；存储不可用或 URL 写入失败时显示提示，列表查询继续执行。重置清空关键词并回到第一页，保留当前每页条数。

抽屉 Demo 顶部可切换保存方式，选择的方式通过 `__query_state__:store` 保留；切换方式会恢复该方式已有的条件，未保存过时使用默认值。切换到 URL 模式时使用默认条件。URL、会话和内存模式保存已提交查询，独立的 `useRouteSearchRecord` 示例继续保存输入草稿。

人工验收：关键词查询后刷新；翻页或修改每页条数后复制 URL；切换工作标签再返回；打开详情深链时保留筛选条件；会话模式离开页面再返回或刷新；memory 模式刷新或离开 pathname 后清空；输入草稿未提交时刷新恢复上次已提交条件；重置后刷新恢复重置结果。当前未执行自动检查或浏览器验收。

参见 [状态与工具使用规范](./state-and-utilities.md)。基础响应式能力使用 Vue 与 VueUse；应用级业务状态使用 Pinia；组件树共享状态使用 createInjectionState。路由搜索记录使用 `src/hooks/useRouteSearchRecord.ts`，命令式 JSON 存储使用 `src/utils/storage.ts`，不复制旧项目的 any 类型与全局存储单例。

工具示例统一放在 `src/views/examples`，通过“工具示例”菜单访问。包含未保存修改挽留、路由搜索记录、存储模型、VueUse 快捷用法、G2Plot 图表和 UI 组件规范页面，展示本地交互和关键调用片段。基础 CRUD 业务模板位于 `src/views/templates/crud.vue`，抽屉交互模板位于 `src/views/templates/crud-drawer.vue`，分别通过“CRUD 页面模板 → 基础表格与弹窗 / 表格与抽屉交互”访问。旧地址 `/examples/crud-drawer` 重定向到 `/templates/crud-drawer`，保留 query 与 hash。

### 未保存修改挽留示例

入口为“工具示例 → 未保存修改挽留”（`/examples/form-leave`），实现位于 `src/views/examples/form-leave.vue`，通用字段展示位于同目录的 `components/LeaveDemoForm.vue`。示例包含页面内编辑、编辑弹窗和编辑抽屉，保存仅更新当前页面内存中的基线，不请求接口或写入存储。

页面通过 `pageLeave.register(getPagePath(route), { isDirty, isBlocked, discard })` 注册本页全部表单，作用域销毁时注销。局部关闭通过 `pageLeave.confirmEntries` 只检查被关闭的表单；取消确认保留输入，通过确认后还原该表单并关闭。页面离开、标签关闭和刷新沿用已有路由守卫、标签操作及 beforeunload 处理。保存或改回基线值后不再提示；多个未保存表单离开页面时只弹一次确认。

人工验收：修改页面字段后尝试结束编辑、离开页面、关闭或刷新当前标签；选择继续编辑检查输入保留，选择放弃修改检查操作完成；同时修改页面表单和弹窗，关闭弹窗仅处理弹窗；保存或改回原值后关闭不提示；修改后刷新浏览器出现原生提示。示例未执行自动检查或浏览器验收。

## 待人工验收

抽屉接入仅完成源码检查，未执行构建、类型检查、单元测试、格式化及浏览器验收。基础弹窗验收入口为 `/templates/crud`；抽屉验收入口为 `/templates/crud-drawer`：详情内编辑保存后返回更新后的详情；选择器应用后保留原表单；关闭、换记录和页签刷新选择“继续编辑”保留现场；批量关闭取消不删除页签；浏览器刷新原生提示；`?drawer=detail&id=1` 深链只产生一个工作页签；暗色主题及窄屏。管理员、角色和权限页面需分别检查编辑弹窗与选项失败保护。真实后端接口尚未联调。

## 图表开发

Element Plus 已升级到 2.14.7，标签菜单使用 Dropdown 的 contextmenu 与虚拟触发定位。升级同步了依赖清单、锁文件和本地依赖，未运行安装生命周期脚本；未执行构建及浏览器兼容性验收。

环境统一为 Node.js 22、pnpm 9。图表使用 AntV G2Plot，示例位于 `src/views/examples/charts.vue`，详见 [图表开发规范](./charts.md)。

## 代码检查与格式化

使用 Oxlint 检查 JavaScript、TypeScript 和 Vue 脚本，使用 Oxfmt 格式化源码及 Vue 模板。Vue 模板类型检查由 vue-tsc 完成。

- `pnpm lint`：检查代码，不写入文件。
- `pnpm lint:fix`：应用 Oxlint 支持的修复。
- `pnpm format`：使用 Oxfmt 格式化，Vue 多属性标签按行展开。
- `pnpm check`：依次执行 lint、类型检查和格式检查。

编辑器使用 Oxc 扩展，工作区已配置保存时格式化。CSS、SCSS 和 Vue 样式由 Oxfmt 格式化，Stylelint 已停用。

# 标准页面示例覆盖

规则来源：`/Users/tangxiangmin/streamax-spec/ai-process/profile/shared/knowledge/standards/saas-web-page`。
实现位置：`src/views/standards`；菜单入口：标准页面示例。

本项目使用 Vue 3、Element Plus、Vue Router。Streamax 文档中的 React、Poppy、runtime-material API 在本仓库按交互语义实现；本仓库未引入这些包，不声明原平台 API 兼容性。

## 页面入口

| 路径                    | 场景                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `/standards/table`      | 复合关键词、日期区间、筛选抽屉、已应用标签、分页、排序、字段显隐、多选、导出、CRUD |
| `/standards/query-tabs` | Tab 查询隔离、内存缓存、当前 Tab URL 恢复、切 Tab 关闭抽屉与挽留                   |
| `/standards/tree`       | 左树右表、组织查询统一存储、重置保留组织                                           |
| `/standards/cards`      | 卡片列表复用相同 CRUD 抽屉、操作权限、详情编辑刷新                                 |
| `/standards/inbound`    | 旧扁平查询迁入查询态、一次性抽屉深链                                               |
| `/standards/customize`  | `customizeTableModel` 字段级定制、`set`、`hidden`、文案与列宽                      |
| `/standards/forms`      | 单 Form 分区、多独立 Form Tabs、多步骤、异步回填、独立页复用 Content               |

所有页面使用本地内存示例数据，浏览器刷新恢复 64 条初始记录。CRUD 使用现有 `template.example` 权限；只读账号不显示新增、编辑、复制、删除操作。标准页面无需业务后端。

## 规则与实现

| 规则文件或主题                       | 当前实现                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| table-query-list-items               | `QueryListContainer`；字段明确 inline、trigger；非 inline Tag 读取 requestParams；筛选草稿取消后不应用                          |
| table-query-keyword / keyword-search | 抽屉选择器使用单 keyword；主列表使用 keywordSearch `{ keyword, fields }`；编码 trim，空搜索编码为 null                          |
| table-query-datetime-range           | 完整范围触发；最近 1/7/30 天快捷项与本地日期收藏；异步默认值经 initialPartialParamsFns 汇总后首查；重置恢复默认区间             |
| table-sort-export                    | 服务端排序语义；取消排序清除 orderBy/order；CSV 读取已应用查询和当前可见列；已选导出读取 selection                              |
| table-field-visibility-state         | 列和查询项 hidden；查询、多选由公共 Hook 持有；页面不保存平行状态                                                               |
| table-model-customize                | `createStandardTableModel` 每个组件生成独立字段；基线后调用 customizeTableModel；仅暴露字段定制                                 |
| table-query-tabs                     | `QueryTabs` 缓存非活动 Tab 查询；URL 仅当前查询；CRUD 自动注册关闭器；继续编辑阻止切换                                          |
| table-tree-list                      | groupIds 位于唯一查询态；树选复用 apply；重置保留 groupIds                                                                      |
| table-card-list                      | list 插槽渲染卡片；仍由 useCrudDrawer 管理 CRUD；纯 Form/Detail Content 与表格共用                                              |
| table-operate-buttons                | 公共 OperateButtons 支持显隐、禁用、危险项、外露数量、更多菜单和递归子菜单；卡片导出包含完整/摘要两个子项；表格操作列停止行点击 |
| table-crud-drawer-event              | useCrudDrawer 删除成功通知 onRemoved；CrudDrawerPage 接 selection.removeItems；刷新时同步已选记录展示值                         |
| table-query-inbound-deeplink         | inboundQuery 白名单解码纯函数；迁移后摘除旧查询键；useCrudDeepLink 消费 drawer/id 后摘除；请求编码不含动作参数                  |
| table-hard-constraints               | CRUD 壳管理开关与行高亮；页列表默认 URL；抽屉表格显式 memory 独立 key；分页在抽屉内；保留竞态防护、错误与空态                   |
| 表单分层 / 复用                      | StandardFormContent、ScenarioFormContent 无关闭、刷新列表、Footer；按钮与步骤编排位于适配壳                                     |
| form-leave-guard                     | useFormState 管理 touched；单 Form 分区无切换确认；独立 Form 切走检查当前表单并重置；页面离开检查全部                           |
| 程序化回填                           | setFieldsValueWithoutTouch 更新基准且保留已存在 touched；标准 CRUD 动作同样提供该入口                                           |
| 保存与关闭                           | 校验成功后保存，清脏后关闭；详情中编辑后刷新上层详情；取消、关闭、返回列表经过既有挽留                                          |
| 详情 Tabs / 标题 / Footer            | StandardDetailContent 分区 Descriptions；DrawerStack 标题插槽；编辑保存后读取最新记录；操作在壳 Footer                          |
| 自定义二级抽屉                       | actions.openRoute 打开关联记录选择器；独立 memory 查询；应用后返回原表单并标记用户操作                                          |
| 搜索存储                             | 原 URL/sessionStorage/memory/none 示例保留；hasStored 区分无状态与用户主动清空值                                                |

## 本地复现路径

沿用项目已有本地启动方式与登录流程，打开上表路由。

旧链接示例：`/standards/inbound?keyword=标准&status=1&groupId=2`。
详情深链：`/standards/inbound?drawer=detail&id=2`。
编辑深链：`/standards/table?drawer=edit&id=2`。
新增深链：`/standards/table?drawer=add`。

建议人工核对：关键词防抖、筛选取消/应用/Tag 清除、日期清空后刷新、取消排序、跨页勾选后删除其中一条、导出筛选结果与已选结果、Tab 挽留阻止切换、树表重置、详情编辑后回传、抽屉内查询不改页面 URL、异步回填无操作直接关闭、多独立表单切走放弃、多步骤末次完整校验。

## 验证与范围

此次仅进行规则读取、实现和源码接线核对。按项目要求，未执行构建、类型检查、单元测试、lint、格式化或浏览器交互验收；未安装依赖、未提交、未发布。

Streamax 的模块包边界、React 专用字段 SchemaForm/Poppy API、行业页面共享协议和国际化资源机制不属于本 Vue 模板的现有运行环境；本次提供对应交互与字段配置能力，未移植原平台依赖。日期预设收藏以 presetKey 隔离，保存在浏览器本地存储。

# UI 配置与页面开发规范

## 配置入口

`src/config/ui.ts` 是 UI 默认值的统一入口。修改默认字号、字号比例、间距、圆角、容器宽度、断点、默认主色和组件尺寸时，在此文件调整。

| 配置                                 | 调用方                                                   |
| ------------------------------------ | -------------------------------------------------------- |
| font.defaultSize / minSize / maxSize | 全局 store、App.vue、设置抽屉                            |
| font.scale                           | UnoCSS text-*、Element Plus 字号变量、G2Plot Canvas 字号 |
| provider                             | App.vue 的 ElConfigProvider、全局 store 的组件密度默认值 |
| space / radius / size                | UnoCSS 语义类、布局样式、Element Plus 高度和圆角变量     |
| colors                               | UnoCSS text-ui-* / bg-ui-*、浅色与深色主题               |
| breakpoints                          | UnoCSS 响应式前缀、工作台 useMediaQuery                  |
| table / chart                        | 表格列宽与 Canvas 数值适配                               |

`uno.config.ts` 读取 UI_UNO_THEME，并通过 UI_CSS preflight 生成 CSS 变量。`App.vue` 把持久化字号同步到根节点的 --ui-font-size-base；根字号变化后，rem 单位同步缩放。Element Plus Provider 的 size 控制组件密度，字体通过同一配置生成的 --el-font-size-* 变量控制，Provider 本身没有 fontSize 属性。

基础字号默认 16px，设置范围 14–20px，即时生效并随主题偏好持久化。旧缓存缺少 fontSize 时使用默认值，非法值恢复或限制到有效范围。「恢复默认」读取当前配置的 defaultSize。修改默认值不会覆盖用户已经保存的个人偏好；验证新的默认值时使用恢复默认操作。

## 语义化尺寸

| 场景                 | 类名     | 默认 16px 下的字号 |
| -------------------- | -------- | ------------------ |
| 注释、代码、次要标记 | text-xs  | 14px               |
| 辅助信息             | text-sm  | 15px               |
| 正文、表单、菜单     | text-md  | 16px               |
| 区块标题             | text-lg  | 18px               |
| 弹窗标题             | text-xl  | 20px               |
| 页面标题             | text-2xl | 26px               |

业务页面使用 text-xs / text-sm / text-md 等类；颜色使用 text-ui-text / text-ui-muted / text-ui-accent；间距优先 gap-sm / gap-md / p-lg；圆角使用 rounded-md / rounded-lg。不要使用 text-[13px]、内联 font-size 或局部写死 rem 比例替代语义 token。

后台内容区域默认使用 w-full，占满可用宽度，不设置最大宽度。表单、登录页等独立容器按用途使用 w-filter / max-w-form / h-chart 等语义类。行内表单的 Select 由公共适配层通过 `.el-form-item__content > .el-select` 设置 filter 宽度，不依赖选中内容撑开；普通纵向表单保持填满容器。只有边框、焦点描边等不参与内容缩放的细线保留 px。组件 API 必须接受数值时进行集中转换：表格使用 useUiTokens().tableWidths，Canvas 使用 useG2PlotTheme，不在业务页重复换算。

## 页面组合

优先级：已有业务组件 → 基础容器组件和 Element Plus → UnoCSS 类与 shortcut → 必要的组件内部样式。

- PageContainer：页面标题、说明、actions 插槽、100% 内容宽度与纵向间距，不设置 max-width。
- ContentCard：区块标题、说明、actions 插槽、卡片边界与内容间距。
- PageGrid：2/3/4 列响应式布局，移动端单列。
- CrudPage：列表、搜索、分页和编辑弹窗，业务页面只声明字段与规则。
- CodeBlock：代码片段，inline 模式展示权限编码。
- ui-row / ui-between / ui-stack：常用横向、两端对齐、纵向布局。

```vue
<PageContainer title="业务页面" description="页面用途">
  <template #actions><el-button type="primary">新增</el-button></template>
  <PageGrid>
    <ContentCard title="区块标题">
      <p class="text-md text-ui-muted m-0">说明文字</p>
      <div class="ui-row"><el-button>操作</el-button></div>
    </ContentCard>
  </PageGrid>
</PageContainer>
```

组件显式 import；UnoCSS 动态状态使用完整静态类名映射，不能通过字符串拼接生成 text-${size}、grid-cols-${n}。通用语义 shortcut 集中于 uno.config.ts，新增前确认已有组件和 shortcut 是否满足需求。

单侧分割线使用方向一致的类，例如 `border-b border-b-solid border-ui-border`。不将 `border-b` 与四边生效的 `border-solid` 混用：项目未启用全局边框 reset，其他边会采用浏览器默认的 medium 宽度。

不为纯布局创建新的 style scoped 或页面 SCSS。复杂网格区域切换、第三方组件内部结构、teleport 弹层等无法直接在模板表达的样式可留在拥有该能力的组件层，并消费统一 CSS 变量。当前 Workbench 的 grid-template-areas、菜单弹层适配以及 design-tokens.scss 的 Element Plus 内部适配属于此范围。

不展示 WORKSPACE / MANAGEMENT 等无功能的装饰性标签。页面标题、说明和操作按钮采用统一结构。

## 示例与检查范围

`/examples/ui` 展示字体层级、表单控件、弹窗和页面组合；可结合右上角界面设置观察字号变化。现有首页、权限页面、CRUD 模板、工具示例和登录页已采用通用组件或 UnoCSS；未对上游保留的全部历史演示页面逐一重写。

本次未运行构建、类型检查、测试或浏览器验收。人工验收重点：字号 14/16/20、刷新保留、恢复默认、深浅主题、四种布局、折叠与弹出菜单、弹窗、表格横向滚动和窄屏。

## 官方参考

- [UnoCSS 配置](https://unocss.dev/config/)
- [UnoCSS Shortcuts](https://unocss.dev/config/shortcuts)
- [Element Plus Config Provider](https://element-plus.org/en-US/component/config-provider)
- [Element Plus 主题定制](https://element-plus.org/en-US/guide/theming)

## 登录与错误页

登录页使用浅色画布、双栏说明与表单卡片，窄屏仅保留登录表单。登录通过表单 submit 提交，支持输入框内回车；请求期间防重复提交，输入框使用 username / current-password 自动填充语义。

`src/components/SceneIllustration/index.vue` 提供 login、403、404、500 四组本地 SVG 场景，共享主题变量与几何风格，无远程图片请求。SVG viewBox 内的数值用于绘图坐标，页面展示尺寸仍使用 max-w-illustration 等语义类。旧登录图片和错误页 PNG 已移除。

`src/components/ErrorMessage/ErrorPage.vue` 统一错误页布局、说明、工作台入口与返回操作，三个错误路由传入状态码。没有站内历史记录时返回工作台。403 提示检查权限，404 提示检查地址，500 提示加载或服务异常，不将所有异常统一描述为断网。

登录和错误页的容器尺寸在 UI_CONFIG.size 的 login / illustration / error 中维护。侧栏品牌区使用 my-sm、导航区使用 pt-sm 提供顶部留白，不修改横向布局的顶栏高度。

## 账号入口与确认弹窗

四种工作台布局的账号入口统一位于顶栏右侧，侧栏不展示账号。窄屏隐藏账号名称，保留头像和退出操作。

MessageBox 使用 UI_CONFIG.size.confirm，最大宽度限制在视口范围内。不能只将 max-width 改为视口宽度并保留默认 width:100%，否则确认框会铺满屏幕。业务编辑弹窗继续使用独立的 dialog 尺寸。

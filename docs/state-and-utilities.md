# 状态与工具使用规范

## 依赖与迁移范围

项目已依赖 `@vueuse/core`，package.json 范围为 `^13.1.0`，本地已安装版本为 13.9.0。本次未安装或升级依赖。示例按本地版本 API 编写；升级前核实函数签名和行为。

参考 fitness-admin 的 `src/hooks/util.ts`、`src/utils/storage.ts`，迁移搜索记录和存储模型的业务语义。所有 Vue/VueUse API 使用显式 import。

| 原工具                   | 当前用法                                           | 说明                                                                        |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------- |
| useRouteSearchRecord     | `@/hooks/useRouteSearchRecord`                     | VueUse useStorage + 路由/账号命名空间、结构校验、默认值工厂                 |
| useSearchStore           | `@/hooks/useSearchStore`                           | CRUD 已提交查询态；URL / sessionStorage / memory / none，恢复关键词与分页   |
| createStorageModel       | `@/utils/storage` 的命名导出                       | 保留 get/set/update/remove；移除 any、隐式字符串模式及按 key 缓存的全局单例 |
| useDialog                | `useToggle`                                        | 直接控制布尔状态                                                            |
| useLoading               | 读取使用 `useAsyncState`；写入沿用业务 saving 保护 | 不统一替换业务并发逻辑                                                      |
| useList                  | Vue ref/reactive 数组的 push/splice/filter         | 简单数组操作无需建立工具层                                                  |
| useQuery 的类型强转      | useRoute + computed + 字段解析                     | query 可能是 string、null、数组，不直接断言成业务接口                       |
| 手工 provide/inject 组合 | `createInjectionState`                             | 新增组件树共享示例，参考项目未发现对应通用注入工具                          |
| 手工事件注册与卸载       | `useEventListener`                                 | 工作台快捷键已采用；必须在 setup/有效作用域内调用                           |

不迁移原项目的认证、课程、编辑器专用存储键。模板继续使用现有登录与权限体系。

## 状态的归属

| 场景                               | 首选                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| 单组件状态、派生状态               | ref / reactive / computed                              |
| 显隐开关、计数、防抖、事件、剪贴板 | 对应 VueUse 函数，直接 import                          |
| 页面内多个后代共享状态             | createInjectionState；父级 setup 提供，后代 setup 获取 |
| 全站账号、权限、布局状态           | 当前 Pinia store                                       |
| 组件中的自动持久化状态             | useStorage；搜索条件使用 useRouteSearchRecord          |
| 非组件代码按需读写 JSON            | createStorageModel                                     |
| 带分页、编辑校验、并发查询的 CRUD  | 现有 useCrud / CrudPage                                |

不要为单个布尔值建立 Pinia store，不要为了复用几个函数创建全局可变状态。组件树内的状态随 Provider 实例创建，跨页面业务状态由明确的 Pinia 模块管理。缓存不作为权限或服务端数据的权威来源。

## 路由搜索记录

```ts
import { useRouteSearchRecord } from "@/hooks/useRouteSearchRecord";

interface ISearch {
  keyword: string;
  enabled: boolean;
}

function validate(value: unknown): value is ISearch {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.keyword === "string" && typeof row.enabled === "boolean";
}

const { searchParams, reset, storageKey, storageError } = useRouteSearchRecord(() => ({ keyword: "", enabled: true }), {
  validate,
  version: 1
});

// template: v-model="searchParams.keyword"
// script: searchParams.value.keyword
// 整体恢复默认值，同时持久化默认值
reset();
```

相对旧项目的变化：第一个参数使用默认值工厂；返回的 searchParams 为 Ref，脚本中需要 `.value`。模板自动解包，可直接绑定。重置整体替换对象，后续读取不得持有旧对象引用，嵌套数组和对象必须由默认值工厂重新创建。

存储键为 `forma:search:v版本:账号范围:路由标识`。默认账号范围来自当前 userInfo.name，路由标识优先 name、其次 path；二者在 setup 时固定，避免 KeepAlive 中非当前页面监听全局路由后串写记录。真实多租户项目应传 `scope: tenantId + ':' + userId`，不要使用可变显示名称作为长期身份标识。会话切换时应销毁旧页面，沿用现有登录清理标签与缓存的流程。

可选参数：`key` 用于同一路由下区分多个表单；`version` 用于缓存结构变更；`storage: 'session'` 切换到标签页会话存储。相同路由参数代表不同业务资源时，显式把资源 ID 纳入 key。

默认记录输入草稿，查询时复制草稿作为已提交条件。恢复条件后是否自动查询由页面决定。本 hook 不改 URL query、不请求接口、不处理分页；业务查询与重置仍需设置页码。搜索草稿关闭跨标签页同步，避免其他标签页输入覆盖当前表单。不要在同一页面重复挂载相同 key 的独立草稿。

CRUD 列表使用 `useSearchStore` 保存已提交条件，由 `useCrud` 恢复关键词和分页后请求。业务页面通过 `CrudPage` / `CrudDrawerPage` 的 `searchStoreOptions` 配置：默认 URL 持久化，`{ type: 'sessionStorage', key: 'orders' }` 保存本次浏览器标签页会话，`{ type: 'memory', key: 'picker' }` 保留同一 pathname 内组件重挂载的条件，`{ type: 'none' }` 不持久化。URL 参数采用保留的 `__query_state__` 命名空间，与抽屉深链及业务 query 合并；工作标签的导航地址保留搜索态，缓存标识忽略搜索态。配置与人工验收项见 [业务模板规范](./admin-template.md#crud-搜索持久化)。

缓存无法解析或校验失败时返回默认值，并通过 storageError 提示；错误记录不会静默删除，下次修改或重置会写入有效值。浏览器禁用存储/配额不足时保留内存表单状态并提示保存失败。只保存 JSON 可序列化数据，不保存密码、token、文件、DOM、函数和响应式对象图。

## 非响应式存储模型

```ts
import { createStorageModel } from "@/utils/storage";

const model = createStorageModel("forma:preferences:v1:user-42", {
  defaults: () => ({ keyword: "", enabled: true }),
  validate, // 与上面的 ISearch 结构匹配
  storage: () => window.localStorage,
  onError: error => console.warn("读取偏好失败", error)
});

const value = model.get();
model.set({ ...value, enabled: false });
model.update(current => ({ ...current, enabled: !current.enabled }));
model.remove();
```

storage 使用工厂，调用读写方法时才访问浏览器存储。localStorage 和 sessionStorage 使用各自实例，不共享缓存；同名 key 不混用存储后端。get 每次读取，缺失/损坏时返回独立默认值；错误通过 onError 通知。set/update/remove 的写入错误会抛出，调用方捕获后显示反馈，不提前提示保存成功。update 为同步读改写，不提供跨标签页原子事务保证。

模型不提供响应式订阅，原生写入也不触发 VueUse 同标签同步；同一 key 不混用模型写入和 useStorage 自动保存。组件自动持久化场景直接选择 useStorage。更复杂的缓存迁移在拥有数据结构的业务模块完成。

## VueUse 常用组合

```ts
import { ref } from "vue";
import { refDebounced, useAsyncState, useClipboard, useEventListener, useToggle } from "@vueuse/core";

const [visible, toggleVisible] = useToggle(false);
toggleVisible(true);

const keyword = ref("");
const delayedKeyword = refDebounced(keyword, 300);
// 要延后执行函数时使用 useDebounceFn；仅需要延后一个响应式值时使用 refDebounced。

const { state, error, isLoading, execute } = useAsyncState(fetchRows, [], {
  immediate: false,
  onError: handleLoadError
});
function reload() {
  if (!isLoading.value) void execute();
}

const { copy, copied, isSupported } = useClipboard({ source: keyword });
// 用户点击时 await copy()，捕获剪贴板权限错误。

useEventListener(document, "keydown", handleShortcut);
```

防抖只控制触发频率，不解决请求竞态。当前 VueUse 13.9.0 的 useAsyncState 执行函数没有请求序号或自动取消保护；允许并发时由业务层使用 AbortController 或请求序号。useCrud 已有最后请求生效逻辑，不应直接替换成 useAsyncState。写操作仍需要防重复提交、校验和权限判断。失败状态由 error/isReady 判断，execute 默认不会因为请求失败抛出；不要只以 execute 返回就判定保存成功。

### 组件树注入

`src/views/examples/useExampleCounter.ts` 使用 createInjectionState 创建 Provider/Consumer，父组件通过初始参数创建状态，子组件拿到只读 count 与 inc/dec/reset 动作；缺少 Provider 时给出明确错误。两个 Provider 具有独立计数器。通用 hook 不依赖示例模块；业务页面按同样模式在本业务模块定义上下文。

### URL 查询参数

```ts
const route = useRoute();
const keyword = computed(() => (typeof route.query.keyword === "string" ? route.query.keyword : ""));
```

需要分享筛选链接时，由业务模块显式解析 query 并用 router.replace 更新；useRouteSearchRecord 只负责浏览器记录，二者不要无条件相互 watch。

## 示例入口

| 路径                    | 源码                                 | 可操作内容                                             |
| ----------------------- | ------------------------------------ | ------------------------------------------------------ |
| /examples/search-record | src/views/examples/search-record.vue | 筛选、查询、整体重置、离开页面后恢复                   |
| /examples/storage       | src/views/examples/storage.vue       | local/session 切换、保存、读取、更新、移除自己的记录   |
| /examples/ui            | src/views/examples/ui.vue            | 字体层级、基础控件、弹窗和布局组件                     |
| /examples/vueuse        | src/views/examples/vueuse.vue        | 弹窗、防抖、模拟加载失败与重试、复制、两组独立注入状态 |

示例页面使用现有 token，按需懒加载，不请求外部示例 API。均需登录，不需要额外业务权限；只展示本地数据。生产项目若不需要工具示例，可移除 businessRouter 中的 examples 分组。示例布局复用 PageContainer、ContentCard、PageGrid 与 UnoCSS，不再维护独立 examples.scss。

本次未执行构建、单元测试、类型检查和浏览器验收。

## 官方参考

- [useStorage](https://vueuse.org/core/usestorage/)：响应式存储、序列化与错误回调。
- [useAsyncState 13.x](https://v13-8-0.vueuse.org/core/useasyncstate/)：异步状态和手动执行。
- [createInjectionState](https://vueuse.org/shared/createinjectionstate/)：组件树内的状态注入。

## 图表示例

新增 `/examples/charts`，使用 AntV G2Plot 展示趋势、对比、占比和排名。生命周期封装、主题和数据规范见 [图表开发规范](./charts.md)。

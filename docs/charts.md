# 图表开发规范

## 环境与依赖

项目统一使用 Node.js 22、pnpm 9，packageManager 固定 pnpm@9.15.0。依赖使用 `pnpm install`，提交依赖变更时同时包含 package.json 和 pnpm-lock.yaml。仓库 .npmrc 固定使用本地 .pnpm-store，已加入 .gitignore，避免与其他 pnpm 主版本共享存储目录。pnpm 9 的锁文件格式仍为 lockfileVersion 9.0，不需要手动降级格式。

使用 `@antv/g2plot` 2.4.x，API 参考 [G2Plot 官方仓库](https://github.com/antvis/G2Plot)。G2Plot 与 G2 的版本和 API 不同，不混用 G2 5 的配置。

## 示例入口

菜单「工具示例 → G2Plot 数据图表」，路径 `/examples/charts`，源码 `src/views/examples/charts.vue`。页面懒加载，需要登录，无额外业务权限。

包含订单趋势折线图、周期对比分组柱状图、渠道占比环图、商品排名条形图。数据为本地确定性模拟数据，日期为模拟的 9 月连续日期，不代表当前真实日期；7/14 天控制样本数量。支持渠道筛选、更新模拟数据、空数据切换，指标和明细表采用同一数据源。

## 组件边界

`src/components/G2PlotChart/index.vue` 管理图表实例生命周期。传入：

- `create`：稳定的图表构造函数，在 setup 中定义，不在模板内创建匿名函数。
- `options`：具体图表类型的配置，使用 computed 生成完整的新对象；不原地修改深层配置。
- `label`：图表的可访问名称。
- `empty`：业务层计算的空数据状态。
  图表容器使用 h-chart，默认高度来自 UI_CONFIG.size.chart；需要另一种高度时传入已有的语义高度类。

```ts
import { computed } from "vue";
import { Line } from "@antv/g2plot";
import type { LineOptions as TLineOptions } from "@antv/g2plot";
import G2PlotChart from "@/components/G2PlotChart/index.vue";

const createLine = (element: HTMLElement, options: TLineOptions) => new Line(element, options);
const options = computed<TLineOptions>(() => ({
  data: rows.value,
  xField: "date",
  yField: "orders",
  autoFit: false
}));
```

模板使用 `<G2PlotChart :create="createLine" :options="options" :empty="!rows.length" label="每日订单量" />`。rows 由业务页定义和加载。

组件用普通变量保存实例，通过 update 更新配置；使用 VueUse useResizeObserver 处理侧栏折叠、布局切换和容器尺寸变化，容器宽高为零时延后创建。传入 autoFit:false，避免同时使用两套尺寸监听。卸载和 KeepAlive 停用时 destroy，重新激活时重建。空数据时销毁实例并展示 el-empty，渲染失败时提供重试。

字号、调色板、图形尺寸和间距由 useG2PlotTheme 读取 UI_CONFIG 与当前字号，按 Canvas API 要求换算成数值。页面不重复声明字体与尺寸。详见 [UI 配置与页面开发规范](./ui-guidelines.md)。

## 视觉与交互

- 图表主题跟随全局 isDark，主系列颜色跟随 primary；同一渠道保持相同颜色。
- 禁止将 CSS var() 直接作为 Canvas 颜色；传实际颜色值。
- 使用明确的标题、单位、图例；数量轴从零开始。饼图只展示非负部分与整体关系，类别过多时采用条形图。
- 遵循 prefers-reduced-motion；useG2PlotTheme 内部用 usePreferredReducedMotion 关闭动画。
- 图表旁提供数字摘要或明细表，不能只依赖颜色和悬停展示信息。
- 空数据、加载、请求失败分别处理。组件处理渲染错误，接口请求状态由业务页面管理，不以 0 代替加载失败。
- 示例使用本地可信数据。业务字段进入 HTML tooltip 前必须进行转义，不直接通过 customContent 拼接外部字符串。
- 不将实例放入 Pinia、深层 reactive 或持久化存储，不通过全局 DOM ID 寻找容器。

本次安装使用 --ignore-scripts，未执行依赖生命周期脚本；未运行构建、类型检查、测试或浏览器验收。

## 安装记录

本次使用 Node 22.19.0、pnpm 9.15.0 完成安装，G2Plot 实际版本为 2.4.35，锁文件格式为 9.0。原包镜像下载 dargs 返回 HTTP 500，最终通过命令级 `--registry https://registry.npmjs.org` 完成，未修改全局 registry。

重建依赖时部分已有依赖在 package.json 范围内重新解析。安装输出的 peer 提示：@unocss/rollup 要求 rollup ^4.0.0，但解析到 2.79.1；vite-plugin-pwa 1.3.0 要求 workbox-build/workbox-window ^7.4.1，但分别解析到 7.1.1/7.1.0。未执行构建，尚未验证这些版本组合的运行表现。

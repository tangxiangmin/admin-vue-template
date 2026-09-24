<template>
  <PageContainer
    title="数据图表"
    description="AntV G2Plot · 运营分析场景，以下均为本地模拟数据。"
  >
    <ContentCard>
      <el-form
        inline
        label-position="top"
        @submit.prevent
      >
        <el-form-item label="统计周期">
          <el-radio-group v-model="days">
            <el-radio-button :value="7">近 7 天</el-radio-button>
            <el-radio-button :value="14">近 14 天</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="channel">
            <el-option
              label="全部渠道"
              value="all"
            />
            <el-option
              v-for="item in channels"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据操作">
          <div class="ui-row">
            <el-button @click="revision++">更新模拟数据</el-button>
            <el-switch
              v-model="empty"
              active-text="空数据"
            />
          </div>
        </el-form-item>
      </el-form>
    </ContentCard>
    <PageGrid :columns="3">
      <ContentCard
        v-for="metric in metrics"
        :key="metric.label"
      >
        <el-statistic
          :title="metric.label"
          :value="metric.value"
        />
        <el-text type="info">当前周期 · {{ channel === "all" ? "全部渠道" : channel }}</el-text>
      </ContentCard>
    </PageGrid>
    <PageGrid>
      <ContentCard
        title="订单趋势"
        description="按日期对比渠道订单量，悬停查看明细，点击图例筛选系列。"
      >
        <G2PlotChart
          :create="createLine"
          :options="lineOptions"
          :empty="empty"
          label="各渠道每日订单量折线图"
        />
      </ContentCard>
      <ContentCard
        title="渠道订单对比"
        description="对比当前周期与上一个等长周期，纵轴单位为订单数。"
      >
        <G2PlotChart
          :create="createColumn"
          :options="columnOptions"
          :empty="empty"
          label="各渠道本期和上期订单量分组柱状图"
        />
      </ContentCard>
      <ContentCard
        title="渠道贡献"
        description="展示当前筛选内各渠道的订单占比。"
      >
        <G2PlotChart
          :create="createPie"
          :options="pieOptions"
          :empty="empty"
          label="各渠道订单占比环图"
        />
      </ContentCard>
      <ContentCard
        title="商品销量排名"
        description="按销量降序展示当前筛选内的商品，单位为件。"
      >
        <G2PlotChart
          :create="createBar"
          :options="barOptions"
          :empty="empty"
          label="商品销量排名条形图"
        />
      </ContentCard>
    </PageGrid>
    <ContentCard
      title="数据明细"
      description="表格与图表使用同一份筛选数据，也可通过表格读取具体数值。"
    >
      <el-table :data="summary">
        <el-table-column
          prop="channel"
          label="渠道"
        />
        <el-table-column
          prop="current"
          label="本期订单"
          align="right"
        />
        <el-table-column
          prop="previous"
          label="上期订单"
          align="right"
        />
        <el-table-column
          label="占比"
          align="right"
        >
          <template #default="{ row }">{{ total ? ((row.current / total) * 100).toFixed(1) : "0.0" }}%</template>
        </el-table-column>
      </el-table>
    </ContentCard>
  </PageContainer>
</template>
<script setup lang="ts" name="exampleCharts">
import PageContainer from "@/components/PageContainer/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import { computed, ref } from "vue";
import { useG2PlotTheme } from "@/hooks/useG2PlotTheme";
import { Bar, Column, Line, Pie } from "@antv/g2plot";
import type {
  BarOptions as TBarOptions,
  ColumnOptions as TColumnOptions,
  LineOptions as TLineOptions,
  PieOptions as TPieOptions
} from "@antv/g2plot";
import G2PlotChart from "@/components/G2PlotChart/index.vue";
import { useGlobalStore } from "@/stores/modules/global";

const global = useGlobalStore();
const chartTheme = useG2PlotTheme();
const channels = ["自然访问", "内容推广", "合作渠道"];

const days = ref(7);
const channel = ref("all");
const empty = ref(false);
const revision = ref(0);
const selected = computed(() => channels.filter(item => channel.value === "all" || item === channel.value));
function amount(day: number, index: number, previous = false) {
  return 45 + index * 23 + ((day * 17 + index * 11 + revision.value * 13) % 63) + (previous ? 0 : 12);
}
const trend = computed(() =>
  empty.value
    ? []
    : selected.value.flatMap(name =>
        Array.from({ length: days.value }, (_, day) => ({
          date: `09/${String(day + 1).padStart(2, "0")}`,
          channel: name,
          orders: amount(day, channels.indexOf(name))
        }))
      )
);
const summary = computed(() =>
  empty.value
    ? []
    : selected.value.map(name => ({
        channel: name,
        current: trend.value.filter(row => row.channel === name).reduce((sum, row) => sum + row.orders, 0),
        previous: Array.from({ length: days.value }, (_, day) => amount(day, channels.indexOf(name), true)).reduce(
          (sum, value) => sum + value,
          0
        )
      }))
);
const total = computed(() => summary.value.reduce((sum, row) => sum + row.current, 0));
const ranking = computed(() =>
  empty.value
    ? []
    : ["专业训练课程", "轻量训练套装", "运动恢复套装", "基础训练课程", "随行运动配件"].map((product, index) => ({
        product,
        sales: Math.round(total.value * (0.32 - index * 0.05))
      }))
);
const metrics = computed(() => [
  { label: "订单总量", value: total.value },
  { label: "日均订单", value: Math.round(total.value / days.value) },
  { label: "参与统计渠道", value: summary.value.length }
]);
const lineOptions = computed<TLineOptions>(() => ({
  ...chartTheme.value.common,
  tooltip: { ...chartTheme.value.tooltip, shared: true },
  data: trend.value,
  xField: "date",
  yField: "orders",
  seriesField: "channel",
  color: ({ channel: name }) => chartTheme.value.palette[channels.indexOf(String(name))],
  yAxis: { min: 0, label: chartTheme.value.axisLabel },
  point: { size: chartTheme.value.pointSize },
  meta: { orders: { alias: "订单数" } }
}));
const columnOptions = computed<TColumnOptions>(() => ({
  ...chartTheme.value.common,
  tooltip: { ...chartTheme.value.tooltip, shared: true },
  data: summary.value.flatMap(row => [
    { channel: row.channel, period: "本期", orders: row.current },
    { channel: row.channel, period: "上期", orders: row.previous }
  ]),
  xField: "channel",
  yField: "orders",
  seriesField: "period",
  isGroup: true,
  color: chartTheme.value.comparison,
  yAxis: { min: 0, label: chartTheme.value.axisLabel },
  maxColumnWidth: chartTheme.value.columnWidth,
  meta: { orders: { alias: "订单数" } }
}));
const pieOptions = computed<TPieOptions>(() => ({
  ...chartTheme.value.common,
  tooltip: chartTheme.value.tooltip,
  data: summary.value,
  angleField: "current",
  colorField: "channel",
  radius: 0.85,
  innerRadius: 0.68,
  color: ({ channel: name }) => chartTheme.value.palette[channels.indexOf(String(name))],
  label: false,
  statistic: {
    title: { content: "订单总量", style: chartTheme.value.titleStyle },
    content: { content: String(total.value), style: chartTheme.value.valueStyle }
  },
  meta: { current: { alias: "订单数" } },
  interactions: [{ type: "element-active" }]
}));
const barOptions = computed<TBarOptions>(() => ({
  ...chartTheme.value.common,
  tooltip: chartTheme.value.tooltip,
  data: ranking.value,
  xField: "sales",
  yField: "product",
  color: global.primary,
  legend: false,
  xAxis: { min: 0, label: chartTheme.value.axisLabel },
  maxBarWidth: chartTheme.value.barWidth,
  meta: { sales: { alias: "销量（件）" } }
}));
const createLine = (element: HTMLElement, options: TLineOptions) => new Line(element, options);
const createColumn = (element: HTMLElement, options: TColumnOptions) => new Column(element, options);
const createPie = (element: HTMLElement, options: TPieOptions) => new Pie(element, options);
const createBar = (element: HTMLElement, options: TBarOptions) => new Bar(element, options);
</script>

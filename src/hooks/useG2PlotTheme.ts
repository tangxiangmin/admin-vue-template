import { computed } from "vue";
import { usePreferredReducedMotion } from "@vueuse/core";
import { UI_CONFIG } from "@/config/ui";
import { useGlobalStore } from "@/stores/modules/global";

/** Canvas 不继承 CSS 字号，将相同的语义 token 转成图表所需的像素值。 */
export function useG2PlotTheme() {
  const global = useGlobalStore();
  const motion = usePreferredReducedMotion();
  return computed(() => {
    const size = global.fontSize;
    const colors = UI_CONFIG.colors[global.isDark ? "dark" : "light"];
    const label = { style: { fontSize: size * UI_CONFIG.font.scale.sm } };
    return {
      common: {
        autoFit: false,
        theme: global.isDark ? "dark" : "default",
        animation: motion.value !== "reduce",
        padding: "auto" as const,
        appendPadding: UI_CONFIG.chart.padding.map(value => value * size),
        legend: { position: "bottom" as const, itemName: label },
        xAxis: { label },
        yAxis: { label }
      },
      tooltip: { showContent: true, domStyles: { "g2-tooltip": { fontSize: `${size * UI_CONFIG.font.scale.sm}px` } } },
      axisLabel: label,
      palette: [global.primary, ...UI_CONFIG.chart.palette],
      comparison: [global.primary, UI_CONFIG.chart.comparison],
      titleStyle: { color: colors.muted, fontSize: `${size * UI_CONFIG.font.scale.md}px` },
      valueStyle: { color: colors.text, fontSize: `${size * UI_CONFIG.font.scale["3xl"]}px` },
      pointSize: UI_CONFIG.chart.pointRadius * size,
      columnWidth: UI_CONFIG.chart.columnWidth * size,
      barWidth: UI_CONFIG.chart.barWidth * size
    };
  });
}

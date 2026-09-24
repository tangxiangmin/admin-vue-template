import { computed } from "vue";
import { UI_CONFIG } from "@/config/ui";
import { useGlobalStore } from "@/stores/modules/global";

/** Element Plus 表格列宽需要数字，按基础字号将语义列宽换算为像素。 */
export function useUiTokens() {
  const global = useGlobalStore();
  const tableWidths = computed(() => {
    const widths = {} as Record<keyof typeof UI_CONFIG.table, number>;
    for (const key of Object.keys(UI_CONFIG.table) as (keyof typeof UI_CONFIG.table)[]) {
      widths[key] = UI_CONFIG.table[key] * global.fontSize;
    }
    return widths;
  });
  return { tableWidths };
}

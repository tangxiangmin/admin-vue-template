/** UI 默认值的唯一入口。保持纯配置，供 UnoCSS 构建和 Vue 运行时共同读取。 */
export const UI_CONFIG = {
  primary: "#2f7d6d",
  font: {
    defaultSize: 16,
    minSize: 14,
    maxSize: 20,
    scale: { xs: 0.875, sm: 0.9375, md: 1, lg: 1.125, xl: 1.25, "2xl": 1.625, "3xl": 2, "4xl": 2.75 },
    family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
  },
  table: { id: 5.5, status: 7.5, name: 10, code: 17, text: 15, actions: 10 },
  chart: {
    palette: ["#6c8fca", "#d9a35f"],
    comparison: "#a6b4c7",
    padding: [1.5, 0.75, 0.5, 0.5],
    pointRadius: 0.1875,
    columnWidth: 2,
    barWidth: 1.25
  },
  provider: { size: "default" as "small" | "default" | "large", button: { autoInsertSpace: false } },
  space: { xs: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1.5rem", xl: "2rem" },
  radius: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem" },
  size: {
    page: "100rem",
    login: "30rem",
    illustration: "35rem",
    error: "64rem",
    sidebar: "16rem",
    collapsed: "4.5rem",
    header: "4.5rem",
    navigation: "3.5rem",
    tabs: "3rem",
    menu: "2.75rem",
    control: "2.5rem",
    "control-small": "2rem",
    "control-large": "3rem",
    dialog: "40rem",
    confirm: "26rem",
    search: "32rem",
    drawer: "24rem",
    form: "24rem",
    filter: "16rem",
    chart: "20rem",
    step: "6rem"
  },
  breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
  colors: {
    light: {
      canvas: "#f6f8fa",
      surface: "#ffffff",
      sidebar: "#fbfcfd",
      text: "#202b38",
      muted: "#768292",
      border: "#e8ecf0",
      soft: "#f0f3f6",
      regular: "#4b5869"
    },
    inverted: {
      canvas: "#18232b",
      surface: "#1d2a33",
      sidebar: "#18232b",
      text: "#e0e8ee",
      muted: "#a0b1bd",
      border: "#34434f",
      soft: "#283944",
      regular: "#c4d0d8"
    },
    dark: {
      canvas: "#11171f",
      surface: "#19222d",
      sidebar: "#141c25",
      text: "#e1e8ef",
      muted: "#93a1b1",
      border: "#2b3745",
      soft: "#222e3b",
      regular: "#b8c3cf"
    }
  }
};

const variables: Record<string, string> = {
  "--ui-font-size-base": `${UI_CONFIG.font.defaultSize}px`,
  "--ui-accent": "var(--el-color-primary)",
  "--ui-radius": "var(--ui-radius-lg)",
  "--el-font-family": UI_CONFIG.font.family,
  "--el-font-size-extra-small": "var(--ui-text-xs)",
  "--el-font-size-small": "var(--ui-text-sm)",
  "--el-font-size-base": "var(--ui-text-md)",
  "--el-font-size-medium": "var(--ui-text-lg)",
  "--el-font-size-large": "var(--ui-text-xl)",
  "--el-font-size-extra-large": "var(--ui-text-2xl)",
  "--el-component-size": "var(--ui-size-control)",
  "--el-component-size-small": "var(--ui-size-control-small)",
  "--el-component-size-large": "var(--ui-size-control-large)",
  "--el-border-radius-base": "var(--ui-radius-md)",
  "--el-border-radius-small": "var(--ui-radius-sm)",
  "--el-text-color-primary": "var(--ui-text)",
  "--el-text-color-regular": "var(--ui-regular)",
  "--el-text-color-secondary": "var(--ui-muted)",
  "--el-border-color": "var(--ui-border)",
  "--el-border-color-light": "var(--ui-border)",
  "--el-border-color-lighter": "var(--ui-border)",
  "--el-bg-color": "var(--ui-surface)",
  "--el-bg-color-overlay": "var(--ui-surface)",
  "--el-bg-color-page": "var(--ui-canvas)",
  "--el-fill-color-blank": "var(--ui-surface)",
  "--el-fill-color-light": "var(--ui-soft)"
};
for (const [key, ratio] of Object.entries(UI_CONFIG.font.scale)) variables[`--ui-text-${key}`] = `${ratio}rem`;
for (const [group, values] of Object.entries({
  space: UI_CONFIG.space,
  radius: UI_CONFIG.radius,
  size: UI_CONFIG.size
})) {
  for (const [key, value] of Object.entries(values)) variables[`--ui-${group}-${key}`] = value;
}
const declarations = (values: Record<string, string>) =>
  Object.entries(values)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
const colors = (values: Record<string, string>) =>
  declarations(Object.fromEntries(Object.entries(values).map(([key, value]) => [`--ui-${key}`, value])));

// :root.dark 保证 Element Plus 的深色变量也复用同一映射。
export const UI_CSS = `:root,:root.dark{${declarations(variables)}}:root{${colors(UI_CONFIG.colors.light)}}:root.dark{${colors(UI_CONFIG.colors.dark)}}html{font-size:var(--ui-font-size-base)}
.aside-inverted .workbench-sidebar,.aside-inverted .workbench-rail,.header-inverted .workbench-header,.header-inverted .horizontal-navigation{${colors(UI_CONFIG.colors.inverted)};--el-text-color-regular:var(--ui-regular);color:var(--ui-text)}`;

const sizeTokens = Object.fromEntries(Object.keys(UI_CONFIG.size).map(key => [key, `var(--ui-size-${key})`]));

export const UI_UNO_THEME = {
  width: sizeTokens,
  height: sizeTokens,
  maxWidth: sizeTokens,
  maxHeight: sizeTokens,
  minHeight: sizeTokens,
  fontSize: Object.fromEntries(Object.keys(UI_CONFIG.font.scale).map(key => [key, `var(--ui-text-${key})`])),
  colors: {
    ui: Object.fromEntries([...Object.keys(UI_CONFIG.colors.light), "accent"].map(key => [key, `var(--ui-${key})`]))
  },
  spacing: {
    ...Object.fromEntries(Object.keys(UI_CONFIG.space).map(key => [key, `var(--ui-space-${key})`])),
    ...Object.fromEntries(Object.keys(UI_CONFIG.size).map(key => [key, `var(--ui-size-${key})`]))
  },
  borderRadius: Object.fromEntries(Object.keys(UI_CONFIG.radius).map(key => [key, `var(--ui-radius-${key})`])),
  breakpoints: UI_CONFIG.breakpoints
};

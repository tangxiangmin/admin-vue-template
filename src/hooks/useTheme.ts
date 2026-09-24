import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";

import { DEFAULT_PRIMARY } from "@/config";
import { useGlobalStore } from "@/stores/modules/global";
import { asideTheme } from "@/styles/theme/aside";
import { headerTheme } from "@/styles/theme/header";
import { menuTheme } from "@/styles/theme/menu";
import type { TTheme, TGreyOrWeak } from "@/typings/theme";

/**
 * @description hex颜色转rgb颜色
 * @param {String} str 颜色值字符串
 * @returns {String} 返回处理后的颜色值
 */
const hexToRgb = (str: any) => {
  let hexs: any = "";
  const reg = /^#?[0-9A-Fa-f]{6}$/;
  if (!reg.test(str)) return ElMessage.warning("输入错误的hex");
  str = str.replace("#", "");
  hexs = str.match(/../g);
  for (let i = 0; i < 3; i++) hexs[i] = parseInt(hexs[i], 16);
  return hexs;
};

/**
 * @description rgb颜色转Hex颜色
 * @param {*} r 代表红色
 * @param {*} g 代表绿色
 * @param {*} b 代表蓝色
 * @returns {String} 返回处理后的颜色值
 */
const rgbToHex = (r: any, g: any, b: any) => {
  const reg = /^\d{1,3}$/;
  if (!reg.test(r) || !reg.test(g) || !reg.test(b)) return ElMessage.warning("输入错误的rgb颜色值");
  const hexs = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i = 0; i < 3; i++) if (hexs[i].length === 1) hexs[i] = `0${hexs[i]}`;
  return `#${hexs.join("")}`;
};

/**
 * @description 加深颜色值
 * @param {String} color 颜色值字符串
 * @param {Number} level 加深的程度，限0-1之间
 * @returns {String} 返回处理后的颜色值
 */
const getDarkColor = (color: string, level: number) => {
  const reg = /^#?[0-9A-Fa-f]{6}$/;
  if (!reg.test(color)) return ElMessage.warning("输入错误的hex颜色值");
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(20.5 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/**
 * @description 变浅颜色值
 * @param {String} color 颜色值字符串
 * @param {Number} level 加深的程度，限0-1之间
 * @returns {String} 返回处理后的颜色值
 */
const getLightColor = (color: string, level: number) => {
  const reg = /^#?[0-9A-Fa-f]{6}$/;
  if (!reg.test(color)) return ElMessage.warning("输入错误的hex颜色值");
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(255 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/**
 * @description 全局主题 hooks
 * */
export const useTheme = () => {
  const globalStore = useGlobalStore();
  const { primary, isDark, isGrey, isWeak, layout, asideInverted, headerInverted } = storeToRefs(globalStore);

  // 切换暗黑模式 ==> 同时修改主题颜色、侧边栏、头部颜色
  const switchDark = () => {
    const html = document.documentElement as HTMLElement;
    if (isDark.value) html.setAttribute("class", "dark");
    else html.setAttribute("class", "");
    changePrimary(primary.value);
    setAsideTheme();
    setHeaderTheme();
  };

  // 修改主题颜色
  const changePrimary = (val: string | null) => {
    if (!val) {
      val = DEFAULT_PRIMARY;
      ElMessage({ type: "success", message: `主题颜色已重置为 ${DEFAULT_PRIMARY}` });
    }
    // 计算主题颜色变化
    document.documentElement.style.setProperty("--el-color-primary", val);
    document.documentElement.style.setProperty(
      "--el-color-primary-dark-2",
      isDark.value ? `${getLightColor(val, 0.2)}` : `${getDarkColor(val, 0.3)}`
    );
    for (let i = 1; i <= 9; i++) {
      const primaryColor = isDark.value ? `${getDarkColor(val, i / 10)}` : `${getLightColor(val, i / 10)}`;
      document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, primaryColor);
    }
    globalStore.setGlobalState("primary", val);
  };

  // 灰色和弱色切换
  const changeGreyOrWeak = (type: TGreyOrWeak, value: boolean) => {
    const body = document.body as HTMLElement;
    if (!value) return body.removeAttribute("style");
    const styles: Record<TGreyOrWeak, string> = {
      grey: "filter: grayscale(1)",
      weak: "filter: invert(80%)"
    };
    body.setAttribute("style", styles[type]);
    const propName = type === "grey" ? "isWeak" : "isGrey";
    globalStore.setGlobalState(propName, false);
  };

  // 设置菜单样式
  const setMenuTheme = () => {
    let type: TTheme = "light";
    if (layout.value === "transverse" && headerInverted.value) type = "inverted";
    if (layout.value !== "transverse" && asideInverted.value) type = "inverted";
    if (isDark.value) type = "dark";
    const theme = menuTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
  };

  // 设置侧边栏样式
  const setAsideTheme = () => {
    let type: TTheme = "light";
    if (asideInverted.value) type = "inverted";
    if (isDark.value) type = "dark";
    const theme = asideTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
    setMenuTheme();
  };

  // 设置头部样式
  const setHeaderTheme = () => {
    let type: TTheme = "light";
    if (headerInverted.value) type = "inverted";
    if (isDark.value) type = "dark";
    const theme = headerTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
    setMenuTheme();
  };

  // init theme
  const initTheme = () => {
    if (["#009688", "#409eff", "#409EFF"].includes(primary.value))
      globalStore.setGlobalState("primary", DEFAULT_PRIMARY);
    switchDark();
    if (isGrey.value) changeGreyOrWeak("grey", true);
    if (isWeak.value) changeGreyOrWeak("weak", true);
  };

  return {
    initTheme,
    switchDark,
    changePrimary,
    changeGreyOrWeak,
    setAsideTheme,
    setHeaderTheme
  };
};

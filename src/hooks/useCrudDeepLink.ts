import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getPagePath } from "@/utils/pageRoute";
interface IDeepLinkOptions {
  ready: () => boolean;
  active: () => boolean;
  busy: () => boolean;
  hasDetailApi: boolean;
  open: (mode: "add" | "edit" | "detail", id?: number) => Promise<unknown>;
}
export function useCrudDeepLink(options: IDeepLinkOptions) {
  const route = useRoute(),
    router = useRouter(),
    pagePath = getPagePath(route);
  let consumed = "";
  async function consume() {
    if (getPagePath(route) !== pagePath || !options.active() || !options.ready() || options.busy()) return;
    const mode = route.query.drawer;
    if (mode !== "add" && mode !== "edit" && mode !== "detail") {
      consumed = "";
      return;
    }
    const signature = `${mode}:${route.query.id ?? ""}`;
    if (signature === consumed) return;
    consumed = signature;
    const id = Number(route.query.id);
    if (mode !== "add" && (!Number.isSafeInteger(id) || id <= 0 || !options.hasDetailApi))
      ElMessage.warning("此抽屉链接需要有效 ID 和详情查询接口");
    else await options.open(mode, mode === "add" ? undefined : id);
    if (getPagePath(route) !== pagePath || `${route.query.drawer}:${route.query.id ?? ""}` !== signature) return;
    const query = { ...route.query };
    delete query.drawer;
    delete query.id;
    await router.replace({ path: route.path, query, hash: route.hash });
  }
  onMounted(consume);
  watch(() => [options.ready(), route.fullPath, options.active()], consume);
}

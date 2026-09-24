import { onMounted, ref, shallowRef } from "vue";
import { getAllOptions } from "@/api/modules/permission";
import type { ICrudApi } from "@/typings/crud";
export function usePermissionOptions<T>(api: ICrudApi<T>) {
  const options = shallowRef<T[]>([]);
  const loading = ref(true);
  const error = ref("");
  async function reload() {
    loading.value = true;
    error.value = "";
    try {
      options.value = await getAllOptions(api);
    } catch {
      error.value = "关联选项加载失败，请重试后编辑";
    } finally {
      loading.value = false;
    }
  }
  onMounted(reload);
  return { options, loading, error, reload };
}

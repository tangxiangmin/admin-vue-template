import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useQueryListRequest } from "@/hooks/useQueryListRequest";
import type { IListQueryOptions } from "@/typings/query";
import type { ICrudApi } from "@/typings/crud";
import type { TSearchStoreOptions } from "@/typings/search";

interface ICrudOptions<T> {
  api: ICrudApi<T>;
  can: (action: "add" | "edit" | "remove") => boolean;
  rowLabel: (row: T) => string;
  query?: IListQueryOptions;
  searchStoreOptions?: () => TSearchStoreOptions | undefined;
}
export function useCrud<T>(options: ICrudOptions<T>) {
  const query = useQueryListRequest<T>({
    request: options.api.getList,
    query: options.query,
    searchStoreOptions: options.searchStoreOptions
  });
  const saving = ref(false),
    removing = ref(false);
  const message = (err: unknown) => (err instanceof Error ? err.message : "操作失败，请重试");
  const getList = query.getList;
  async function save(row: T, mode: "add" | "edit", validate: () => Promise<boolean>) {
    if (saving.value || !options.can(mode)) return false;
    saving.value = true;
    try {
      if (!(await validate()) || !options.can(mode)) return false;
      await options.api[mode](row);
      ElMessage.success("保存成功");
      await getList();
      return true;
    } catch (err) {
      ElMessage.error(message(err));
      return false;
    } finally {
      saving.value = false;
    }
  }
  async function remove(row: T) {
    if (!options.api.remove || removing.value || !options.can("remove")) return false;
    removing.value = true;
    try {
      try {
        await ElMessageBox.confirm(`确认删除“${options.rowLabel(row)}”？删除后无法恢复。`, "删除记录", {
          type: "warning",
          confirmButtonText: "确认删除",
          cancelButtonText: "取消"
        });
      } catch {
        return false;
      }
      if (!options.can("remove")) return false;
      await options.api.remove(row);
      ElMessage.success("删除成功");
      await getList();
      return true;
    } catch (err) {
      ElMessage.error(message(err));
      return false;
    } finally {
      removing.value = false;
    }
  }
  return { ...query, saving, removing, save, remove };
}

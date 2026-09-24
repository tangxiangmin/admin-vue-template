import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { ICrudApi } from "@/typings/crud";

interface ICrudOptions<T> {
  api: ICrudApi<T>;
  createRow: () => T;
  can: (action: "add" | "edit" | "remove") => boolean;
  rowLabel: (row: T) => string;
}
export function useCrud<T>(options: ICrudOptions<T>) {
  const list = shallowRef<T[]>([]);
  const currentRow = ref(options.createRow()) as import("vue").Ref<T>;
  const page = ref(1);
  const pageSize = ref(20);
  const total = ref(0);
  const keyword = ref("");
  const loading = ref(false);
  const saving = ref(false);
  const removing = ref(false);
  const error = ref("");
  const formDialogVisible = ref(false);
  const mode = ref<"add" | "edit">("add");
  let appliedKeyword = "";
  let requestId = 0;
  let initialForm = "";
  const message = (err: unknown) => (err instanceof Error ? err.message : "操作失败，请重试");
  async function getList() {
    const id = ++requestId;
    loading.value = true;
    error.value = "";
    try {
      const result = await options.api.getList({
        pageNum: page.value,
        pageSize: pageSize.value,
        keyword: appliedKeyword
      });
      if (id !== requestId) return;
      list.value = result.list;
      total.value = result.total;
      const lastPage = Math.max(1, Math.ceil(result.total / pageSize.value));
      if (page.value > lastPage) {
        page.value = lastPage;
        await getList();
      }
    } catch (err) {
      if (id === requestId) {
        list.value = [];
        total.value = 0;
        error.value = message(err);
      }
    } finally {
      if (id === requestId) loading.value = false;
    }
  }
  function search() {
    appliedKeyword = keyword.value.trim();
    page.value = 1;
    return getList();
  }
  function reset() {
    keyword.value = "";
    return search();
  }
  function changeCurrent(value: number) {
    page.value = value;
    return getList();
  }
  function changeSize(value: number) {
    pageSize.value = value;
    page.value = 1;
    return getList();
  }
  function open(row?: T) {
    const action = row ? "edit" : "add";
    if (!options.can(action) || saving.value) return;
    mode.value = action;
    currentRow.value = row ? JSON.parse(JSON.stringify(row)) : options.createRow();
    initialForm = JSON.stringify(currentRow.value);
    formDialogVisible.value = true;
  }
  async function close(done?: () => void) {
    if (saving.value) return;
    if (JSON.stringify(currentRow.value) !== initialForm) {
      try {
        await ElMessageBox.confirm("尚有未保存的修改，确认放弃？", "关闭编辑", {
          type: "warning",
          confirmButtonText: "放弃修改",
          cancelButtonText: "继续编辑"
        });
      } catch {
        return;
      }
    }
    formDialogVisible.value = false;
    done?.();
  }
  async function save(validate: () => Promise<boolean>) {
    if (saving.value || !options.can(mode.value)) return;
    saving.value = true;
    try {
      if (!(await validate()) || !options.can(mode.value)) return;
      await options.api[mode.value](currentRow.value);
      formDialogVisible.value = false;
      ElMessage.success("保存成功");
      await getList();
    } catch (err) {
      ElMessage.error(message(err));
    } finally {
      saving.value = false;
    }
  }
  async function remove(row: T) {
    if (!options.api.remove || removing.value || !options.can("remove")) return;
    removing.value = true;
    try {
      try {
        await ElMessageBox.confirm(`确认删除“${options.rowLabel(row)}”？删除后无法恢复。`, "删除记录", {
          type: "warning",
          confirmButtonText: "确认删除",
          cancelButtonText: "取消"
        });
      } catch {
        return;
      }
      if (!options.can("remove")) return;
      await options.api.remove(row);
      ElMessage.success("删除成功");
      await getList();
    } catch (err) {
      ElMessage.error(message(err));
    } finally {
      removing.value = false;
    }
  }
  onMounted(getList);
  onBeforeUnmount(() => {
    requestId++;
  });
  return {
    list,
    currentRow,
    page,
    pageSize,
    total,
    keyword,
    loading,
    saving,
    removing,
    error,
    formDialogVisible,
    mode,
    getList,
    search,
    reset,
    changeCurrent,
    changeSize,
    open,
    close,
    save,
    remove
  };
}

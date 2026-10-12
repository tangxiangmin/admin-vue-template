import { computed, onBeforeUnmount, ref, type Ref } from "vue";
import { useRoute } from "vue-router";
import { usePageLeaveStore } from "@/stores/modules/pageLeave";
import { getPagePath } from "@/utils/pageRoute";

interface ICrudDialogOptions<T> {
  createRow: () => T;
  can: (action: "add" | "edit") => boolean;
  saving: () => boolean;
  ready: () => boolean;
  save: (row: T, mode: "add" | "edit", validate: () => Promise<boolean>) => Promise<boolean>;
}

/** 基础 CRUD 的单层编辑弹窗，不查询详情、不消费抽屉深链。 */
export function useCrudDialog<T>(options: ICrudDialogOptions<T>) {
  const visible = ref(false);
  const currentRow = ref(options.createRow()) as Ref<T>;
  const mode = ref<"add" | "edit">("add");
  const changing = ref(false);
  let baseline = "";
  const dirty = computed(() => visible.value && JSON.stringify(currentRow.value) !== baseline);
  const pageLeave = usePageLeaveStore();
  const unregister = pageLeave.register(getPagePath(useRoute()), {
    isDirty: () => dirty.value,
    isBlocked: () => options.saving() || changing.value,
    discard: () => {
      visible.value = false;
    }
  });
  onBeforeUnmount(unregister);
  async function confirm() {
    return pageLeave.confirmEntries([{ isDirty: () => dirty.value, isBlocked: options.saving }]);
  }
  async function open(row?: T) {
    const action = row ? "edit" : "add";
    if (options.saving() || changing.value || !options.ready() || !options.can(action)) return;
    changing.value = true;
    try {
      if (!(await confirm())) return;
      currentRow.value = row ? JSON.parse(JSON.stringify(row)) : options.createRow();
      baseline = JSON.stringify(currentRow.value);
      mode.value = action;
      visible.value = true;
    } finally {
      changing.value = false;
    }
  }
  async function close(done?: () => void) {
    if (options.saving() || changing.value) return;
    changing.value = true;
    try {
      if (!(await confirm())) return;
      visible.value = false;
      done?.();
    } finally {
      changing.value = false;
    }
  }
  async function save(validate: () => Promise<boolean>) {
    if (!visible.value || changing.value || !options.ready()) return;
    if (await options.save(currentRow.value, mode.value, validate)) visible.value = false;
  }
  return { visible, currentRow, mode, open, close, save };
}

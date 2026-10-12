import { computed, ref } from "vue";
// touched 只由用户事件置位；程序化回填更新基准并保留已有操作语义。
export function useFormState<T extends object>(model: T) {
  const copy = (value: T): T => JSON.parse(JSON.stringify(value));
  let baseline = copy(model);
  const touched = ref(false);
  function replace(values: T) {
    Object.keys(model).forEach(key => delete (model as Record<string, unknown>)[key]);
    Object.assign(model, copy(values));
  }
  function setFieldsValueWithoutTouch(values: T) {
    baseline = copy(values);
    replace(values);
  }
  function markTouched() {
    touched.value = true;
  }
  function reset() {
    replace(baseline);
    touched.value = false;
  }
  function markSaved() {
    baseline = copy(model);
    touched.value = false;
  }
  return { isDirty: computed(() => touched.value), setFieldsValueWithoutTouch, markTouched, reset, markSaved };
}

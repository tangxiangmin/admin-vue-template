<template>
  <div class="query-list ui-stack p-md sm:px-lg">
    <el-form
      label-position="top"
      class="query-list__form"
      @submit.prevent="emit('search')"
    >
      <el-form-item
        v-for="field in displayedFields"
        :key="field.key"
        :label="field.label"
      >
        <template v-if="field.key === 'keywordSearch'">
          <div class="query-list__keyword">
            <el-select
              v-if="draft.keywordSearch"
              v-model="draft.keywordSearch.fields"
              multiple
              :collapse-tags="true"
              style="width: 10rem"
              aria-label="搜索字段"
              @change="trigger(field)"
            >
              <el-option
                label="名称"
                value="name"
              />
              <el-option
                label="编码"
                value="code"
              />
            </el-select>
            <el-input
              v-if="draft.keywordSearch"
              v-model="draft.keywordSearch.keyword"
              :placeholder="field.placeholder"
              clearable
              class="w-filter"
              @input="trigger(field)"
              @clear="trigger(field)"
            />
          </div>
        </template>
        <el-input
          v-else-if="field.kind === 'text'"
          v-model="draft.keyword"
          :placeholder="field.placeholder"
          clearable
          class="w-filter"
          @input="trigger(field)"
          @clear="trigger(field)"
        />
        <el-select
          v-else-if="field.kind === 'select'"
          v-model="draft.status"
          clearable
          class="w-filter"
          @change="trigger(field)"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            v-bind="option"
          />
        </el-select>
        <el-date-picker
          v-else
          v-model="draft.timeRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          :shortcuts="shortcuts"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="trigger(field)"
        />
      </el-form-item>
      <slot name="query-extra" />
      <div class="query-list__actions">
        <el-button @click="reset">重置</el-button>
        <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          查询
        </el-button>
        <el-button
          v-if="collapsedFields.length"
          link
          type="primary"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          {{ expanded ? "收起" : "展开" }}
          <i :class="[expanded ? 'i-ep-arrow-up' : 'i-ep-arrow-down', 'ml-xs']" />
        </el-button>
        <slot name="actions" />
      </div>
    </el-form>
    <div
      v-if="!expanded && tags.length"
      class="ui-row"
    >
      <el-tag
        v-for="tag in tags"
        :key="tag.field.key"
        closable
        @close="removeTag(tag.field)"
      >
        {{ tag.field.label }}：{{ tag.value }}
      </el-tag>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onScopeDispose, ref } from "vue";
import type { IPageQuery } from "@/typings/crud";
import type { IQueryField } from "@/typings/query";
const props = defineProps<{ fields: IQueryField[]; draft: IPageQuery; applied: IPageQuery; loading: boolean }>();
const emit = defineEmits<{ search: []; reset: []; apply: [patch: Partial<IPageQuery>] }>();
const expanded = ref(false);
const visibleFields = computed(() => props.fields.filter(field => !field.hidden));
const primaryFields = computed(() => {
  const fields = visibleFields.value.filter(field => field.inline);
  return fields.length ? fields : visibleFields.value.slice(0, 2);
});
const collapsedFields = computed(() => visibleFields.value.filter(field => !primaryFields.value.includes(field)));
const displayedFields = computed(() => (expanded.value ? visibleFields.value : primaryFields.value));
let timer: ReturnType<typeof setTimeout> | undefined;
const clearTimer = () => {
  if (timer) clearTimeout(timer);
};
onScopeDispose(clearTimer);
function trigger(field: IQueryField) {
  clearTimer();
  if (field.trigger === "manual") return;
  if (field.trigger === "range-complete" && props.draft.timeRange && props.draft.timeRange.length !== 2) return;
  if (field.trigger === "debounced-change") timer = setTimeout(() => emit("search"), 500);
  else emit("search");
}
function reset() {
  clearTimer();
  emit("reset");
}
function removeTag(field: IQueryField) {
  const value =
    field.key === "keywordSearch"
      ? { keyword: "", fields: props.applied.keywordSearch?.fields ?? ["name", "code"] }
      : undefined;
  emit("apply", { [field.key]: value, pageNum: 1 });
}
const tags = computed(() =>
  collapsedFields.value
    .map(field => {
      const value = props.applied[field.key];
      return {
        field,
        value:
          value == null || value === ""
            ? ""
            : field.format
              ? field.format(value)
              : (field.options?.find(option => option.value === value)?.label ?? String(value))
      };
    })
    .filter(tag => tag.value)
);
const shortcuts = [1, 7, 30].map(days => ({
  text: `最近 ${days} 天`,
  value: () => {
    const end = new Date(),
      start = new Date(end);
    start.setDate(start.getDate() - days);
    return [start, end];
  }
}));
</script>
<style scoped>
.query-list {
  container-type: inline-size;
}
.query-list__form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: end;
  gap: var(--ui-space-md) var(--ui-space-lg);
}
.query-list__form :deep(.el-form-item) {
  margin: 0;
  min-width: 0;
}
.query-list__form :deep(.el-form-item__content) {
  min-width: 0;
}
.query-list__form :deep(.el-input),
.query-list__form :deep(.el-select),
.query-list__form :deep(.el-date-editor) {
  width: 100%;
  min-width: 0;
}
.query-list__keyword,
.query-list__actions {
  display: flex;
  align-items: center;
  gap: var(--ui-space-sm);
}
.query-list__keyword {
  width: 100%;
  min-width: 0;
}
.query-list__keyword :deep(.el-select) {
  flex-shrink: 0;
  max-width: 40%;
}
.query-list__keyword :deep(.el-input) {
  flex: 1;
  width: 0;
}
.query-list__actions {
  grid-column: -2 / -1;
  justify-content: flex-end;
  flex-wrap: wrap;
  min-height: var(--el-component-size);
}
.query-list__actions :deep(.el-button) {
  margin: 0;
  height: var(--el-component-size);
}
@container (min-width: 640px) {
  .query-list__form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container (min-width: 1100px) {
  .query-list__form {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>

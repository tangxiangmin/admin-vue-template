<template>
  <PageContainer
    title="存储模型"
    description="在非组件代码中通过 get / set / update / remove 读写 JSON 数据。此示例只操作自己的存储键。"
  >
    <PageGrid>
      <ContentCard
        title="偏好设置示例"
        description="切换存储区域后读取对应记录。localStorage 跨刷新保留，sessionStorage 限当前标签页会话。"
      >
        <div class="ui-row">
          <el-radio-group
            v-model="storageArea"
            @change="read"
          >
            <el-radio-button value="local">localStorage</el-radio-button>
            <el-radio-button value="session">sessionStorage</el-radio-button>
          </el-radio-group>
        </div>
        <el-alert
          v-if="notice"
          :title="notice"
          :type="failed ? 'warning' : 'success'"
          :closable="false"
        />
        <el-form label-position="top">
          <el-form-item label="显示名称">
            <el-input
              v-model="draft.displayName"
              maxlength="40"
            />
          </el-form-item>
          <el-form-item label="紧凑模式"><el-switch v-model="draft.compact" /></el-form-item>
        </el-form>
        <div class="ui-row">
          <el-button
            type="primary"
            @click="save"
          >
            保存
          </el-button>
          <el-button @click="read">重新读取</el-button>
          <el-button @click="increment">更新计数</el-button>
          <el-button @click="remove">移除示例记录</el-button>
        </div>
        <el-text
          tag="p"
          type="info"
        >
          移除仅删除本示例记录，下次读取返回默认值。表单修改不会自动保存。
        </el-text>
        <CodeBlock>{{ JSON.stringify(draft, null, 2) }}</CodeBlock>
      </ContentCard>
      <ContentCard title="调用方式">
        <CodeBlock>{{ usage }}</CodeBlock>
        <el-text
          tag="p"
          type="info"
        >
          {{ model.key }}
        </el-text>
        <el-text
          tag="p"
          type="info"
        >
          模型按调用时的存储区域读取，不维护全局单例缓存。需要响应式自动保存时直接使用 VueUse useStorage。
        </el-text>
      </ContentCard>
    </PageGrid>
  </PageContainer>
</template>
<script setup lang="ts" name="exampleStorage">
import PageContainer from "@/components/PageContainer/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import CodeBlock from "@/components/CodeBlock/index.vue";
import { computed, ref } from "vue";
import { createStorageModel } from "@/utils/storage";
import { useUserStore } from "@/stores/modules/user";
interface IPreferences {
  displayName: string;
  compact: boolean;
  visits: number;
}
const defaults = (): IPreferences => ({ displayName: "默认工作空间", compact: false, visits: 0 });
function validate(value: unknown): value is IPreferences {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.displayName === "string" &&
    typeof record.compact === "boolean" &&
    typeof record.visits === "number" &&
    Number.isSafeInteger(record.visits) &&
    record.visits >= 0
  );
}
const user = useUserStore();
const storageArea = ref<"local" | "session">("local");
const notice = ref("");
const failed = ref(false);
function onError(error: unknown) {
  failed.value = true;
  notice.value = error instanceof Error ? error.message : "浏览器存储不可用";
}
const key = `forma:examples:preferences:v1:${encodeURIComponent(user.userInfo.name)}`;
const model = computed(() =>
  createStorageModel(key, {
    defaults,
    validate,
    onError,
    storage: storageArea.value === "local" ? () => window.localStorage : () => window.sessionStorage
  })
);
const draft = ref(model.value.get());
function run(action: () => void, message: string) {
  notice.value = "";
  failed.value = false;
  try {
    action();
    if (!failed.value) notice.value = message;
  } catch (error) {
    onError(error);
  }
}
function read() {
  run(() => {
    draft.value = model.value.get();
  }, "已读取当前存储区域");
}
function save() {
  run(() => model.value.set(draft.value), "已保存");
}
function increment() {
  run(() => {
    draft.value = model.value.update(value => ({ ...value, visits: value.visits + 1 }));
  }, "已基于存储中的记录更新计数");
}
function remove() {
  run(() => {
    model.value.remove();
    draft.value = model.value.get();
  }, "已移除示例记录，恢复默认值");
}
const usage = `const model = createStorageModel(key, {
  defaults: () => ({ displayName: '', compact: false, visits: 0 }),
  validate,
  storage: () => window.localStorage,
  onError
})
model.get()
model.set(preferences)
model.update(value => ({ ...value, visits: value.visits + 1 }))
model.remove()`;
</script>

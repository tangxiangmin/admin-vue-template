<template>
  <PageContainer
    title="VueUse 快捷用法"
    description="直接组合现有工具，示例数据与异步请求均在本地运行。"
  >
    <PageGrid>
      <ContentCard
        title="开关与防抖"
        description="useToggle 控制弹窗；refDebounced 在输入停止 300ms 后更新预览。"
      >
        <div class="ui-row"><el-button @click="toggleDialog(true)">打开弹窗</el-button></div>
        <el-input
          v-model="keyword"
          placeholder="连续输入，观察下方预览"
          clearable
          aria-label="防抖示例输入"
        />
        <el-text
          tag="p"
          type="info"
        >
          即时值：{{ keyword || "—" }}
          <br />
          防抖值：{{ debounced || "—" }}
        </el-text>
        <CodeBlock>{{ toggleUsage }}</CodeBlock>
      </ContentCard>
      <ContentCard
        title="异步状态"
        description="useAsyncState 管理 loading、结果和错误。按钮防重复触发；失败后可重试。"
      >
        <div class="ui-row">
          <el-checkbox
            v-model="shouldFail"
            :disabled="isLoading"
          >
            模拟失败
          </el-checkbox>
          <el-button
            type="primary"
            :loading="isLoading"
            @click="load"
          >
            加载示例
          </el-button>
        </div>
        <el-alert
          v-if="requestError"
          :title="requestError instanceof Error ? requestError.message : '加载失败'"
          type="error"
          :closable="false"
        />
        <el-text
          v-else
          tag="p"
          type="info"
        >
          {{ isLoading ? "正在读取本地示例…" : isReady ? result : "尚未加载" }}
        </el-text>
        <CodeBlock>{{ asyncUsage }}</CodeBlock>
      </ContentCard>
      <ContentCard
        title="复制文本"
        description="useClipboard 提供复制状态反馈，浏览器拒绝访问时显示错误。"
      >
        <div class="ui-row">
          <el-input
            v-model="copySource"
            aria-label="待复制文本"
          />
          <el-button
            :disabled="!isSupported"
            @click="copyText"
          >
            {{ copied ? "已复制" : "复制文本" }}
          </el-button>
        </div>
        <el-alert
          v-if="!isSupported"
          title="当前浏览器不支持剪贴板"
          type="warning"
          :closable="false"
        />
        <CodeBlock>{{ clipboardUsage }}</CodeBlock>
      </ContentCard>
      <ContentCard
        title="组件树状态注入"
        description="createInjectionState 为每个 Provider 创建独立状态。同组两个子组件同步，不同组互不影响；子组件通过动作修改只读状态。"
      >
        <CounterProvider
          title="组件组一"
          :initial="1"
        />
        <CounterProvider
          title="组件组二"
          :initial="10"
        />
        <CodeBlock>{{ injectionUsage }}</CodeBlock>
      </ContentCard>
    </PageGrid>
    <el-dialog
      v-model="dialogVisible"
      title="useToggle 弹窗示例"
      width="var(--ui-size-dialog)"
    >
      <el-text
        tag="p"
        type="info"
      >
        状态直接由 useToggle 返回，无需额外封装 useDialog。
      </el-text>
      <template #footer>
        <el-button
          type="primary"
          @click="toggleDialog(false)"
        >
          关闭
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
<script setup lang="ts" name="exampleVueUse">
import PageContainer from "@/components/PageContainer/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import CodeBlock from "@/components/CodeBlock/index.vue";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { promiseTimeout, refDebounced, useAsyncState, useClipboard, useToggle } from "@vueuse/core";
import CounterProvider from "./components/CounterProvider.vue";
const [dialogVisible, toggleDialog] = useToggle(false);
const keyword = ref("");
const debounced = refDebounced(keyword, 300);
const shouldFail = ref(false);
const {
  state: result,
  isLoading,
  isReady,
  error: requestError,
  execute
} = useAsyncState(
  async () => {
    const fail = shouldFail.value;
    await promiseTimeout(600);
    if (fail) throw new Error("模拟请求失败：取消勾选后可以重试");
    return "本地示例数据加载成功";
  },
  "",
  { immediate: false, onError: () => undefined }
);
function load() {
  if (!isLoading.value) void execute();
}
const copySource = ref("使用 VueUse 组合后台页面能力");
const { copy, copied, isSupported } = useClipboard({ source: copySource });
async function copyText() {
  try {
    await copy();
  } catch {
    ElMessage.error("复制失败，请检查浏览器剪贴板权限");
  }
}
const toggleUsage = `const [visible, toggle] = useToggle(false)
const keyword = ref('')
const delayed = refDebounced(keyword, 300)
toggle(true) // 显式打开`;
const asyncUsage = `const { state, isLoading, error, execute } = useAsyncState(
  fetchData, [], { immediate: false, onError: handleError }
)
function load() {
  if (!isLoading.value) void execute()
}`;
const clipboardUsage = `const { copy, copied, isSupported } = useClipboard({ source })
// 点击时调用 copy()，捕获浏览器权限错误`;
const injectionUsage = `const [provideCounter, injectCounter] = createInjectionState(
  (initial) => useCounter(initial)
)
// 父组件 setup：provideCounter(1)
// 子组件 setup：injectCounter()
// 业务状态模块对外提供只读状态与显式动作`;
</script>

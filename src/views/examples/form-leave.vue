<template>
  <PageContainer
    title="未保存修改挽留"
    description="修改表单后尝试关闭或离开。选择继续编辑保留输入，选择放弃修改执行当前操作；改回保存值后不再提示。"
  >
    <PageGrid>
      <ContentCard
        title="页面内编辑"
        description="修改后可尝试结束编辑、离开页面或关闭工作标签。保存仅更新当前页面的内存快照。"
      >
        <template #actions>
          <el-tag :type="pageEditor.dirty ? 'warning' : 'success'">
            {{ pageEditor.dirty ? "有未保存修改" : "无未保存修改" }}
          </el-tag>
        </template>
        <LeaveDemoForm
          v-if="pageEditor.visible"
          :model="pageEditor.form"
          :disabled="closing"
        />
        <el-descriptions
          v-else
          :column="1"
          border
        >
          <el-descriptions-item label="名称">{{ pageEditor.form.name }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ pageEditor.form.remark || "未填写" }}</el-descriptions-item>
        </el-descriptions>
        <div class="ui-row">
          <template v-if="pageEditor.visible">
            <el-button
              type="primary"
              :disabled="closing || !pageEditor.dirty"
              @click="pageEditor.save"
            >
              保存到本页
            </el-button>
            <el-button
              :disabled="closing"
              @click="closeEditor(pageEditor)"
            >
              结束编辑
            </el-button>
          </template>
          <el-button
            v-else
            :disabled="closing"
            @click="pageEditor.open"
          >
            开始编辑
          </el-button>
        </div>
      </ContentCard>
      <ContentCard
        title="关闭与离开操作"
        description="以下操作复用现有路由守卫和工作标签菜单的保护逻辑。多个未保存表单只弹一次确认。"
      >
        <el-text>当前未保存表单：{{ dirtyCount }} 个</el-text>
        <div class="ui-row">
          <el-button
            :disabled="closing"
            @click="dialogEditor.open"
          >
            打开编辑弹窗
          </el-button>
          <el-button
            :disabled="closing"
            @click="drawerEditor.open"
          >
            打开编辑抽屉
          </el-button>
        </div>
        <div class="ui-row">
          <el-button
            :disabled="closing"
            @click="leavePage"
          >
            离开当前页面
          </el-button>
          <el-button
            :disabled="closing"
            @click="tabActions.close"
          >
            关闭当前标签
          </el-button>
          <el-button
            :disabled="closing"
            @click="tabActions.refresh"
          >
            刷新当前标签
          </el-button>
          <el-button
            :disabled="closing"
            @click="reloadBrowser"
          >
            刷新浏览器
          </el-button>
        </div>
        <el-text type="info">
          弹窗和抽屉的取消、关闭按钮、Esc、点击遮罩均检查对应表单。路由离开和标签关闭、刷新检查本页全部表单。
        </el-text>
        <el-text type="info">
          浏览器刷新和关闭窗口使用浏览器原生提示，提示文案由浏览器决定。未保存状态不写入存储，刷新后恢复示例初值。
        </el-text>
      </ContentCard>
    </PageGrid>
    <el-dialog
      v-model="dialogEditor.visible"
      title="弹窗表单挽留"
      width="var(--ui-size-dialog)"
      :before-close="closeDialog"
      :close-on-click-modal="!closing"
      :close-on-press-escape="!closing"
      :show-close="!closing"
      destroy-on-close
    >
      <LeaveDemoForm
        :model="dialogEditor.form"
        :disabled="closing"
      />
      <template #footer>
        <el-button
          :disabled="closing"
          @click="closeEditor(dialogEditor)"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="closing || !dialogEditor.dirty"
          @click="dialogEditor.save"
        >
          保存到本页
        </el-button>
      </template>
    </el-dialog>
    <el-drawer
      v-model="drawerEditor.visible"
      title="抽屉表单挽留"
      :size="narrow ? '100%' : 'var(--ui-size-form-drawer)'"
      :before-close="closeDrawer"
      :close-on-click-modal="!closing"
      :close-on-press-escape="!closing"
      :show-close="!closing"
      append-to-body
      destroy-on-close
    >
      <LeaveDemoForm
        :model="drawerEditor.form"
        :disabled="closing"
      />
      <template #footer>
        <el-button
          :disabled="closing"
          @click="closeEditor(drawerEditor)"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="closing || !drawerEditor.dirty"
          @click="drawerEditor.save"
        >
          保存到本页
        </el-button>
      </template>
    </el-drawer>
  </PageContainer>
</template>
<script setup lang="ts" name="exampleFormLeave">
import { computed, onScopeDispose, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMediaQuery } from "@vueuse/core";
import { ElMessage } from "element-plus";
import PageContainer from "@/components/PageContainer/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import LeaveDemoForm from "./components/LeaveDemoForm.vue";
import { UI_CONFIG } from "@/config/ui";
import { usePageLeaveStore } from "@/stores/modules/pageLeave";
import { useTabsStore } from "@/stores/modules/tabs";
import { useTabActions } from "@/layouts/components/Tabs/useTabActions";
import { getPagePath } from "@/utils/pageRoute";

function createEditor(name: string, initiallyVisible = false) {
  const form = reactive({ name, remark: "修改名称或备注后，尝试关闭或离开。" });
  const baseline = ref(JSON.stringify(form));
  const visible = ref(initiallyVisible);
  const dirty = computed(() => visible.value && JSON.stringify(form) !== baseline.value);
  function discard() {
    Object.assign(form, JSON.parse(baseline.value));
    visible.value = initiallyVisible;
  }
  function save() {
    baseline.value = JSON.stringify(form);
    ElMessage.success("已保存到当前页面内存");
  }
  function open() {
    if (visible.value) return;
    Object.assign(form, JSON.parse(baseline.value));
    visible.value = true;
  }
  return reactive({ form, visible, dirty, discard, save, open });
}

const pageEditor = createEditor("页面内编辑示例", true);
const dialogEditor = createEditor("弹窗编辑示例");
const drawerEditor = createEditor("抽屉编辑示例");
const editors = [pageEditor, dialogEditor, drawerEditor];
const dirtyCount = computed(() => editors.filter(editor => editor.dirty).length);
const closing = ref(false);
const narrow = useMediaQuery(`(max-width: ${UI_CONFIG.breakpoints.md})`);
const route = useRoute();
const router = useRouter();
const pagePath = getPagePath(route);
const pageLeave = usePageLeaveStore();
const tabs = useTabsStore();
const tabActions = useTabActions(() => tabs.tabsMenuList.find(tab => tab.path === pagePath));
const unregister = pageLeave.register(pagePath, {
  isDirty: () => dirtyCount.value > 0,
  isBlocked: () => closing.value,
  discard: () => editors.forEach(editor => editor.discard())
});
onScopeDispose(unregister);

async function closeEditor(editor: ReturnType<typeof createEditor>, done?: () => void) {
  if (closing.value || !editor.visible) return;
  closing.value = true;
  try {
    if (!(await pageLeave.confirmEntries([{ isDirty: () => editor.dirty }]))) return;
    editor.discard();
    editor.visible = false;
    done?.();
  } finally {
    closing.value = false;
  }
}
const closeDialog = (done: () => void) => closeEditor(dialogEditor, done);
const closeDrawer = (done: () => void) => closeEditor(drawerEditor, done);
const leavePage = () => router.push("/examples/search-record");
const reloadBrowser = () => window.location.reload();
</script>

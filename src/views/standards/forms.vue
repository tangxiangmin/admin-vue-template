<template>
  <PageContainer
    title="表单场景与挽留"
    description="用户操作触发 touched；程序化回填不触发挽留。保存通过校验后清除 touched；提交和回填期间阻止关闭。"
  >
    <PageGrid>
      <ContentCard
        title="单 Form 分区与多步骤"
        description="同一表单的分区 Tab 直接切换，关闭时统一挽留。多步骤在适配层编排按钮，最后统一校验。"
      >
        <div class="ui-row">
          <el-button @click="open('partition')">分区表单抽屉</el-button>
          <el-button @click="open('steps')">多步骤表单抽屉</el-button>
        </div>
      </ContentCard>
      <ContentCard
        title="多独立 Form Tabs"
        description="每个 Tab 独立注册挽留。切走前只检查当前 Form，放弃后恢复该 Form 初值；页面离开检查全部。"
      >
        <div class="ui-row">
          <el-button @click="open('independent')">多表单抽屉</el-button>
          <el-button @click="open('async')">异步回填抽屉</el-button>
        </div>
      </ContentCard>
      <ContentCard
        title="独立页复用 Content"
        description="此表单与抽屉复用 ScenarioFormContent，字段与校验定义只在 Content 内维护。"
      >
        <ScenarioFormContent
          ref="pageForm"
          :model="pageModel"
          :disabled="saving"
          @touch="pageState.markTouched"
        />
        <div class="ui-row">
          <el-tag :type="pageState.isDirty.value ? 'warning' : 'success'">
            {{ pageState.isDirty.value ? "已操作，未保存" : "未操作或已保存" }}
          </el-tag>
          <el-button
            type="primary"
            :loading="saving"
            @click="savePage"
          >
            保存到本页
          </el-button>
          <el-button
            :disabled="saving"
            @click="resetPage"
          >
            重置
          </el-button>
        </div>
      </ContentCard>
    </PageGrid>
    <el-drawer
      v-model="visible"
      :title="titles[scenario]"
      :size="narrow ? '100%' : 'var(--ui-size-form-drawer)'"
      :before-close="close"
      :close-on-click-modal="!busy"
      :close-on-press-escape="!busy"
      :show-close="!busy"
      append-to-body
    >
      <div v-loading="filling">
        <el-alert
          v-if="scenario === 'async'"
          title="回填完成后直接关闭不会挽留；编辑后再次回填仍保留 touched。"
          type="info"
          :closable="false"
          class="mb-md"
        />
        <el-tabs
          v-if="scenario === 'independent'"
          :model-value="activeForm"
          :before-leave="switchForm"
        >
          <el-tab-pane
            label="基本资料"
            name="base"
          />
          <el-tab-pane
            label="附加资料"
            name="extra"
          />
        </el-tabs>
        <el-tabs
          v-if="scenario === 'partition'"
          v-model="section"
        >
          <el-tab-pane
            label="基础信息"
            name="base"
          />
          <el-tab-pane
            label="备注信息"
            name="remark"
          />
        </el-tabs>
        <el-steps
          v-if="scenario === 'steps'"
          :active="step"
          class="mb-lg"
        >
          <el-step title="基础信息" />
          <el-step title="备注信息" />
        </el-steps>
        <template v-if="scenario === 'independent'">
          <ScenarioFormContent
            v-show="activeForm === 'base'"
            ref="baseForm"
            :model="baseModel"
            :disabled="busy"
            @touch="baseState.markTouched"
          />
          <ScenarioFormContent
            v-show="activeForm === 'extra'"
            ref="extraForm"
            :model="extraModel"
            :disabled="busy"
            @touch="extraState.markTouched"
          />
        </template>
        <ScenarioFormContent
          v-else
          ref="baseForm"
          :section="
            scenario === 'partition'
              ? section === 'base'
                ? 'base'
                : 'remark'
              : scenario === 'steps'
                ? step === 0
                  ? 'base'
                  : 'remark'
                : undefined
          "
          :model="baseModel"
          :disabled="busy"
          @touch="baseState.markTouched"
        />
      </div>
      <template #footer>
        <el-button
          :disabled="busy"
          @click="close()"
        >
          取消
        </el-button>
        <el-button
          v-if="scenario === 'async'"
          :disabled="busy"
          @click="fill"
        >
          重新回填
        </el-button>
        <el-button
          v-if="scenario === 'steps' && step === 1"
          :disabled="busy"
          @click="step = 0"
        >
          上一步
        </el-button>
        <el-button
          v-if="scenario === 'steps' && step === 0"
          type="primary"
          :disabled="busy"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button
          v-else
          type="primary"
          :loading="saving"
          :disabled="filling"
          @click="saveDrawer"
        >
          {{ scenario === "independent" ? "保存当前表单" : "保存并关闭" }}
        </el-button>
      </template>
    </el-drawer>
  </PageContainer>
</template>
<script setup lang="ts" name="standardForms">
import { computed, onScopeDispose, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useMediaQuery } from "@vueuse/core";
import { ElMessage } from "element-plus";
import PageContainer from "@/components/PageContainer/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import ScenarioFormContent from "./components/ScenarioFormContent.vue";
import { useFormState } from "@/hooks/useFormState";
import { usePageLeaveStore } from "@/stores/modules/pageLeave";
import { getPagePath } from "@/utils/pageRoute";
import { UI_CONFIG } from "@/config/ui";
type TScenario = "partition" | "independent" | "steps" | "async";
const titles: Record<TScenario, string> = {
  partition: "单 Form 字段分区",
  independent: "多独立表单",
  steps: "多步骤表单",
  async: "异步程序化回填"
};
const initial = (name: string) => ({ name, status: 1, remark: "", reason: "" });
const baseModel = reactive(initial("基础记录")),
  extraModel = reactive(initial("附加记录")),
  pageModel = reactive(initial("独立页记录"));
const baseState = useFormState(baseModel),
  extraState = useFormState(extraModel),
  pageState = useFormState(pageModel);
const baseForm = ref<InstanceType<typeof ScenarioFormContent>>(),
  extraForm = ref<InstanceType<typeof ScenarioFormContent>>(),
  pageForm = ref<InstanceType<typeof ScenarioFormContent>>();
const visible = ref(false),
  saving = ref(false),
  filling = ref(false),
  closing = ref(false);
const scenario = ref<TScenario>("partition"),
  activeForm = ref("base"),
  section = ref("base"),
  step = ref(0);
const busy = computed(() => saving.value || filling.value || closing.value);
const narrow = useMediaQuery(`(max-width: ${UI_CONFIG.breakpoints.md})`);
const leave = usePageLeaveStore();
const drawerEntries = () =>
  [baseState, ...(scenario.value === "independent" ? [extraState] : [])].map(state => ({
    isDirty: () => state.isDirty.value,
    isBlocked: () => saving.value || filling.value
  }));
const unregister = leave.register(getPagePath(useRoute()), {
  isDirty: () => pageState.isDirty.value || (visible.value && drawerEntries().some(entry => entry.isDirty())),
  isBlocked: () => busy.value,
  discard: () => {
    pageState.reset();
    baseState.reset();
    extraState.reset();
    visible.value = false;
  }
});
let alive = true;
onScopeDispose(() => {
  alive = false;
  unregister();
});
async function open(value: TScenario) {
  if (busy.value || visible.value) return;
  baseState.reset();
  extraState.reset();
  activeForm.value = "base";
  section.value = "base";
  step.value = 0;
  scenario.value = value;
  visible.value = true;
  if (value === "async") await fill();
}
async function fill() {
  if (busy.value) return;
  filling.value = true;
  try {
    const values = await new Promise<ReturnType<typeof initial>>(resolve =>
      setTimeout(() => resolve(initial("异步加载记录")), 600)
    );
    if (alive) baseState.setFieldsValueWithoutTouch(values);
  } finally {
    filling.value = false;
  }
}
async function close(done?: () => void) {
  if (busy.value) return;
  closing.value = true;
  try {
    if (!(await leave.confirmEntries(drawerEntries()))) return;
    baseState.reset();
    extraState.reset();
    visible.value = false;
    done?.();
  } finally {
    closing.value = false;
  }
}
async function switchForm(name: string | number) {
  if (busy.value) return false;
  const state = activeForm.value === "base" ? baseState : extraState;
  closing.value = true;
  try {
    if (!(await leave.confirmEntries([{ isDirty: () => state.isDirty.value }]))) return false;
    state.reset();
    activeForm.value = String(name);
    return true;
  } finally {
    closing.value = false;
  }
}
async function nextStep() {
  if (!busy.value && (await baseForm.value?.validate("base"))) step.value = 1;
}
async function saveDrawer() {
  if (busy.value) return;
  saving.value = true;
  try {
    if (scenario.value === "independent") {
      const form = activeForm.value === "base" ? baseForm.value : extraForm.value;
      if (!(await form?.validate())) return;
      (activeForm.value === "base" ? baseState : extraState).markSaved();
    } else {
      if (!(await baseForm.value?.validate("base"))) {
        step.value = 0;
        section.value = "base";
        return;
      }
      if (!(await baseForm.value?.validate())) {
        step.value = 1;
        section.value = "remark";
        return;
      }
      baseState.markSaved();
      visible.value = false;
    }
    ElMessage.success("已保存到当前页面内存");
  } finally {
    saving.value = false;
  }
}
async function savePage() {
  if (busy.value) return;
  saving.value = true;
  try {
    if (await pageForm.value?.validate()) {
      pageState.markSaved();
      ElMessage.success("已保存到当前页面内存");
    }
  } finally {
    saving.value = false;
  }
}
async function resetPage() {
  if (!busy.value && (await leave.confirmEntries([{ isDirty: () => pageState.isDirty.value }]))) pageState.reset();
}
</script>

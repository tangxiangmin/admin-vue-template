<template>
  <PageContainer
    title="UI 组件规范"
    description="语义字号、容器与基础控件共用一份 UI 配置。可在右上角设置中调整基础字号。"
  >
    <PageGrid>
      <ContentCard
        title="字体层级"
        :description="`当前基础字号 ${global.fontSize}px`"
      >
        <p
          v-for="item in typography"
          :key="item.label"
          :class="item.class"
          class="m-0 leading-relaxed"
        >
          {{ item.label }} · 后台界面文字
        </p>
      </ContentCard>
      <ContentCard
        title="基础控件"
        description="按钮、表单和文字继承 Element Plus Provider 与全局 token。"
      >
        <el-form
          label-position="top"
          @submit.prevent
        >
          <el-form-item label="项目名称">
            <el-input
              v-model="name"
              placeholder="输入项目名称"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="status">
              <el-option
                label="启用"
                value="enabled"
              />
              <el-option
                label="停用"
                value="disabled"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="ui-row">
          <el-button
            type="primary"
            @click="visible = true"
          >
            预览弹窗
          </el-button>
          <el-button @click="name = ''">清空输入</el-button>
          <el-tag>状态标签</el-tag>
        </div>
      </ContentCard>
    </PageGrid>
    <ContentCard
      title="页面组合方式"
      description="页面组合容器和业务组件，常规布局使用 UnoCSS，不单独声明字号与内边距。"
    >
      <CodeBlock>{{ usage }}</CodeBlock>
    </ContentCard>
    <el-dialog
      v-model="visible"
      title="字体与控件预览"
      width="var(--ui-size-dialog)"
    >
      <p class="ui-description">当前输入：{{ name || "未填写" }}。弹窗挂载到页面外层后，仍继承相同的字号变量。</p>
      <template #footer>
        <el-button
          type="primary"
          @click="visible = false"
        >
          关闭
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
<script setup lang="ts" name="exampleUi">
import { ref } from "vue";
import PageContainer from "@/components/PageContainer/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import CodeBlock from "@/components/CodeBlock/index.vue";
import { useGlobalStore } from "@/stores/modules/global";
const global = useGlobalStore();
const name = ref("");
const status = ref("enabled");
const visible = ref(false);
const typography = [
  { label: "text-xs / 注释", class: "text-xs text-ui-muted" },
  { label: "text-sm / 辅助文字", class: "text-sm text-ui-muted" },
  { label: "text-md / 正文", class: "text-md text-ui-text" },
  { label: "text-lg / 区块标题", class: "text-lg text-ui-text font-semibold" },
  { label: "text-2xl / 页面标题", class: "text-2xl text-ui-text font-semibold" }
];
const usage = `<PageContainer title="业务页面" description="页面用途">
  <PageGrid>
    <ContentCard title="业务区块">
      <p class="text-md text-ui-muted">正文内容</p>
      <div class="ui-row">操作按钮</div>
    </ContentCard>
  </PageGrid>
</PageContainer>`;
</script>

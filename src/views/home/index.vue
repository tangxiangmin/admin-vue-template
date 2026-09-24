<template>
  <PageContainer
    title="工作台"
    :description="`欢迎回来，${user.userInfo.name}。从这里开始今天的工作。`"
  >
    <template #actions>
      <el-text type="info">{{ today }}</el-text>
    </template>
    <ContentCard
      title="开始管理你的业务"
      description="管理访问权限、分配角色，或从标准页面模板创建业务模块。"
    >
      <div class="ui-row">
        <el-button
          v-if="canTemplate"
          type="primary"
          @click="$router.push('/templates/crud')"
        >
          打开页面模板
        </el-button>
        <el-button @click="$router.push('/examples/charts')">查看图表示例</el-button>
      </div>
    </ContentCard>
    <PageGrid
      v-if="entries.length"
      :columns="4"
    >
      <ContentCard
        v-for="entry in entries"
        :key="entry.path"
        :title="entry.title"
        :description="entry.description"
      >
        <div class="ui-row">
          <i :class="entry.icon" />
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push(entry.path)"
          >
            进入管理
          </el-link>
        </div>
      </ContentCard>
    </PageGrid>
    <PageGrid>
      <ContentCard title="工作流程">
        <el-steps
          direction="vertical"
          space="var(--ui-size-step)"
        >
          <el-step
            title="定义权限"
            description="为页面和操作建立权限编码。"
          />
          <el-step
            title="分配角色"
            description="组合权限，并关联到管理账号。"
          />
          <el-step
            title="扩展业务"
            description="从标准页面模板构建业务模块。"
          />
        </el-steps>
      </ContentCard>
      <ContentCard title="当前工作空间">
        <el-descriptions
          :column="1"
          border
        >
          <el-descriptions-item label="运行环境">{{ TEMPLATE_DEMO ? "演示模式" : "服务接口" }}</el-descriptions-item>
          <el-descriptions-item label="当前账号">{{ user.userInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="可访问页面">{{ accessiblePages }} 个</el-descriptions-item>
        </el-descriptions>
      </ContentCard>
    </PageGrid>
  </PageContainer>
</template>
<script setup lang="ts" name="home">
import PageContainer from "@/components/PageContainer/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import { computed } from "vue";
import { TEMPLATE_DEMO } from "@/config/template";
import { usePermission } from "@/hooks/usePermission";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";
const user = useUserStore();
const auth = useAuthStore();
const [canTemplate] = usePermission(["template.example.view"]);
const today = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
const accessiblePages = computed(
  () => auth.flatMenuListGet.filter(item => !item.children?.length && !item.meta.isHide).length
);
const entries = computed(() =>
  [
    {
      title: "权限点管理",
      description: "定义页面与操作的访问边界。",
      path: "/system/privileges",
      permission: "permission.privilege.view",
      icon: "i-ep-lock"
    },
    {
      title: "角色管理",
      description: "按职责组织权限，明确协作分工。",
      path: "/system/roles",
      permission: "permission.role.view",
      icon: "i-ep-user"
    },
    {
      title: "管理员管理",
      description: "管理团队账号与角色分配。",
      path: "/system/users",
      permission: "permission.user.view",
      icon: "i-ep-user-filled"
    },
    {
      title: "CRUD 页面模板",
      description: "复用完整的查询与编辑流程。",
      path: "/templates/crud",
      permission: "template.example.view",
      icon: "i-ep-document"
    }
  ].filter(item => auth.hasPermission(item.permission))
);
</script>

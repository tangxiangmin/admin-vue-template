<template>
  <PageContainer
    title="多 Tab 查询列表"
    description="切 Tab 缓存筛选和分页；URL 只保存当前 Tab。切走前关闭抽屉，有未保存修改时确认挽留。刷新后恢复当前 Tab。"
  >
    <QueryTabs
      :items="items"
      v-slot="{ tab }"
    >
      <StandardList
        :key="tab"
        :title="items.find(item => item.key === tab)?.label ?? '组织记录'"
        :group-id="Number(tab)"
      />
    </QueryTabs>
  </PageContainer>
</template>
<script setup lang="ts" name="standardQueryTabs">
import PageContainer from "@/components/PageContainer/index.vue";
import QueryTabs from "@/components/QueryTabs/index.vue";
import StandardList from "./components/StandardList.vue";
const items = [
  { key: "1", label: "华东组织" },
  { key: "2", label: "华南组织" },
  { key: "3", label: "华北组织" }
];
</script>

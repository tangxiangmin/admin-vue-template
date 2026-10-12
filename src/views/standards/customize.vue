<template>
  <StandardList
    title="字段级定制"
    :customize-table-model="customize"
  />
</template>
<script setup lang="ts" name="standardCustomize">
import StandardList from "./components/StandardList.vue";
import type { IStandardTableModel } from "@/typings/query";
import type { IStandardRecord } from "@/typings/standard";
function customize(model: IStandardTableModel<IStandardRecord>) {
  model.fields.remark.set({ hidden: true });
  model.fields.name.set({ label: "业务名称", minWidth: 240 });
  model.queryFields.keywordSearch.set({ placeholder: "搜索业务名称、编码" });
}
</script>

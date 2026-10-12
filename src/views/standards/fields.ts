import type {
  IListColumn,
  IListQueryOptions,
  IStandardTableModel,
  ITableField,
  IQueryModelField
} from "@/typings/query";
import type { IStandardRecord } from "@/typings/standard";
import { standardGroups } from "@/demo/standards";
// 每个调用方创建自己的配置实例，列表、详情、表单不共享可变字段。
export function createStandardColumns(): IListColumn<IStandardRecord>[] {
  return [
    { key: "name", label: "名称", minWidth: 180, sortable: true },
    { key: "code", label: "编码", minWidth: 150, sortable: true },
    { key: "status", label: "状态", minWidth: 100, format: row => (row.status === 1 ? "启用" : "停用") },
    {
      key: "groupId",
      label: "所属组织",
      minWidth: 140,
      format: row => standardGroups.find(group => group.id === row.groupId)?.label ?? "-"
    },
    { key: "createdAt", label: "创建时间", minWidth: 190, sortable: true },
    { key: "remark", label: "备注", minWidth: 200, format: row => row.remark || "-" }
  ];
}
export function createStandardQuery(groupIds?: number[]): IListQueryOptions {
  return {
    fields: [
      {
        key: "keywordSearch",
        label: "关键词",
        kind: "text",
        inline: true,
        trigger: "debounced-change",
        placeholder: "搜索名称、编码",
        format: value => {
          const search = value as { keyword: string; fields: string[] };
          return search.keyword.trim()
            ? `${search.fields.map(field => (field === "name" ? "名称" : "编码")).join("、")}：${search.keyword.trim()}`
            : "";
        }
      },
      {
        key: "timeRange",
        label: "创建时间",
        kind: "dateTimeRange",
        presetKey: "standard-created-at",
        inline: true,
        trigger: "range-complete"
      },
      {
        key: "status",
        label: "状态",
        kind: "select",
        trigger: "manual",
        options: [
          { label: "启用", value: 1 },
          { label: "停用", value: 0 }
        ]
      }
    ],
    initialPartialParamsFns: [
      async () => {
        const end = new Date(),
          start = new Date(end);
        start.setDate(start.getDate() - 30);
        const format = (date: Date) =>
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        return { timeRange: [format(start), format(end)] as [string, string] };
      }
    ],
    initialParams: { groupIds, keywordSearch: { keyword: "", fields: ["name", "code"] } },
    preserveOnReset: ["groupIds"],
    sortableKeys: ["name", "code", "createdAt"]
  };
}

export function createStandardTableModel(): IStandardTableModel<IStandardRecord> {
  const fields = Object.fromEntries(
    createStandardColumns().map(column => {
      const field: ITableField<IStandardRecord> = {
        ...column,
        set(patch) {
          Object.assign(field, patch);
        }
      };
      return [column.key, field];
    })
  );
  const queryFields = Object.fromEntries(
    createStandardQuery().fields.map(config => {
      const field: IQueryModelField = {
        ...config,
        set(patch) {
          Object.assign(field, patch);
        }
      };
      return [config.key, field];
    })
  );
  return { fields, queryFields };
}

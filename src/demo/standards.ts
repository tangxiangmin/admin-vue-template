import type { IStandardRecord } from "@/typings/standard";
import type { ICrudApi, IPageQuery } from "@/typings/crud";
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const date = (offset: number) => {
  const value = new Date();
  value.setDate(value.getDate() - offset);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")} 09:00:00`;
};
let rows: IStandardRecord[] = Array.from({ length: 64 }, (_, index) => ({
  id: index + 1,
  name: `标准记录 ${String(index + 1).padStart(2, "0")}`,
  code: `STD-${String(index + 1).padStart(3, "0")}`,
  status: index % 3 === 0 ? 0 : 1,
  groupId: (index % 3) + 1,
  createdAt: date(index % 45),
  remark: index % 4 === 0 ? "" : "用于查询、分页、导出与抽屉演示"
}));
let nextId = 65;
function filter(query: IPageQuery) {
  const keyword = (query.keywordSearch?.keyword ?? query.keyword)?.trim().toLowerCase() ?? "";
  const result = rows.filter(row => {
    const text = (query.keywordSearch?.fields ?? ["name", "code"]).map(field => row[field]).join(" ");
    return (
      text.toLowerCase().includes(keyword) &&
      (query.status === undefined || row.status === query.status) &&
      (!query.groupIds?.length || query.groupIds.includes(row.groupId)) &&
      (!query.timeRange || (row.createdAt >= query.timeRange[0] && row.createdAt <= query.timeRange[1]))
    );
  });
  const key = query.orderBy;
  if (key === "name" || key === "code" || key === "createdAt")
    result.sort(
      (a, b) => a[key].localeCompare(b[key], "zh-CN", { numeric: true }) * (query.order === "descending" ? -1 : 1)
    );
  return result;
}
function encode(row: IStandardRecord): IStandardRecord {
  return {
    id: row.id,
    name: row.name.trim(),
    code: row.code.trim(),
    status: row.status,
    groupId: row.groupId,
    createdAt: row.createdAt,
    remark: row.remark.trim()
  };
}
function check(row: IStandardRecord) {
  if (!row.name.trim() || !row.code.trim()) throw new Error("名称、编码不能为空");
  if (rows.some(item => item.id !== row.id && item.code === row.code.trim())) throw new Error("编码已存在");
}
export const standardDemoApi: ICrudApi<IStandardRecord> = {
  async getList(query) {
    const result = filter(query);
    return {
      list: copy(result.slice((query.pageNum - 1) * query.pageSize, query.pageNum * query.pageSize)),
      total: result.length
    };
  },
  async getDetail(id) {
    const row = rows.find(row => row.id === id);
    if (!row) throw new Error("记录不存在");
    return copy(row);
  },
  async add(row) {
    check(row);
    rows = [...rows, { ...encode(row), id: nextId++ }];
  },
  async edit(row) {
    check(row);
    if (!rows.some(item => item.id === row.id)) throw new Error("记录不存在");
    rows = rows.map(item => (item.id === row.id ? encode(row) : item));
  },
  async remove(row) {
    rows = rows.filter(item => item.id !== row.id);
  }
};
export async function exportStandardRows(query: IPageQuery) {
  return copy(filter(query));
}
export const standardGroups = [
  { id: 1, label: "华东组织" },
  { id: 2, label: "华南组织" },
  { id: 3, label: "华北组织" }
];

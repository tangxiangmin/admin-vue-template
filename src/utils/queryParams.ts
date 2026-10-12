import type { IPageQuery } from "@/typings/crud";
// 请求编码仅输出列表协议字段；不包含 drawer/id 等一次性动作。
export function encodeQueryParams(query: IPageQuery): IPageQuery {
  const keyword = query.keywordSearch?.keyword.trim() ?? "";
  const fields = query.keywordSearch?.fields.filter(field => field === "name" || field === "code") ?? [];
  return {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    keyword: query.keyword?.trim(),
    keywordSearch:
      query.keywordSearch === undefined ? undefined : keyword && fields.length ? { keyword, fields } : null,
    status: query.status,
    groupIds: query.groupIds,
    timeRange: query.timeRange,
    orderBy: query.orderBy,
    order: query.order
  };
}

export function decodeInboundStandardQuery(values: Record<string, unknown>): Partial<IPageQuery> {
  const result: Partial<IPageQuery> = {};
  if (typeof values.keyword === "string")
    result.keywordSearch = { keyword: values.keyword.trim(), fields: ["name", "code"] };
  if (values.status === "0" || values.status === "1") result.status = Number(values.status);
  const group = typeof values.groupId === "string" ? Number(values.groupId) : undefined;
  if (group && Number.isSafeInteger(group) && group > 0) result.groupIds = [group];
  return result;
}

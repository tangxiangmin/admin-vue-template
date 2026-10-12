import type { IPageQuery } from "./crud";
export interface IQueryField {
  key: "keyword" | "keywordSearch" | "status" | "timeRange";
  label: string;
  kind: "text" | "select" | "dateTimeRange";
  inline?: boolean;
  hidden?: boolean;
  trigger: "manual" | "change" | "debounced-change" | "range-complete";
  placeholder?: string;
  presetKey?: string;
  options?: { label: string; value: number }[];
  format?: (value: unknown) => string;
}
export interface IListColumn<T> {
  key: keyof T & string;
  label: string;
  minWidth?: number;
  hidden?: boolean;
  sortable?: boolean;
  format?: (row: T) => string;
}
export interface IListQueryOptions {
  fields: IQueryField[];
  initialPartialParamsFns?: (() => Promise<Partial<IPageQuery>> | Partial<IPageQuery>)[];
  initialParams?: Partial<IPageQuery>;
  preserveOnReset?: (keyof IPageQuery)[];
  sortableKeys?: string[];
  inboundQuery?: { keys: string[]; decode: (values: Record<string, unknown>) => Partial<IPageQuery> };
}

export interface ITableField<T> extends IListColumn<T> {
  set: (patch: Partial<IListColumn<T>>) => void;
}
export interface IQueryModelField extends IQueryField {
  set: (patch: Partial<IQueryField>) => void;
}
export interface IStandardTableModel<T> {
  fields: Record<string, ITableField<T>>;
  queryFields: Record<string, IQueryModelField>;
}

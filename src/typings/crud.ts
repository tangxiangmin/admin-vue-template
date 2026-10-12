export interface IPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  keywordSearch?: { keyword: string; fields: ("name" | "code")[] } | null;
  status?: number;
  groupIds?: number[];
  timeRange?: [string, string] | null;
  orderBy?: string;
  order?: "ascending" | "descending";
}
export interface IPageResult<T> {
  list: T[];
  total: number;
}
export interface ICrudApi<T> {
  getList: (query: IPageQuery) => Promise<IPageResult<T>>;
  add: (row: T) => Promise<unknown>;
  edit: (row: T) => Promise<unknown>;
  remove?: (row: T) => Promise<unknown>;
  getDetail?: (id: number) => Promise<T>;
}

export type TCrudDrawerMode = "add" | "edit" | "copy" | "detail" | "custom";
export interface IDrawerLayer<T> {
  id: number;
  mode: TCrudDrawerMode;
  title: string;
  record: T;
  route?: string;
  params?: Record<string, unknown>;
}
export interface IFormLeaveEntry {
  isDirty: () => boolean;
  isBlocked?: () => boolean;
}
export interface IPageLeaveEntry extends IFormLeaveEntry {
  discard: () => void;
}

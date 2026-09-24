export interface IPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
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
}

import type { IBaseResponse } from "@/typings/api";
import { customErrorService as http } from "@/api";
import type { ICrudApi, IPageQuery, IPageResult } from "@/typings/crud";
import type { IAdminUser, IPrivilege, IRole } from "@/typings/permission";

function createApi<T>(prefix: string, normalize: (row: T) => T = row => row, extra = {}): ICrudApi<T> {
  return {
    async getList(query) {
      const { data } = await http.post<unknown, IBaseResponse<IPageResult<T>>>(`${prefix}/listByPage`, {
        ...query,
        ...extra
      });
      return { ...data, list: data.list.map(normalize) };
    },
    add: row => http.post<unknown, IBaseResponse>(`${prefix}/add`, row as object),
    edit: row => http.post<unknown, IBaseResponse>(`${prefix}/edit`, row as object)
  };
}
const remoteRoleApi = createApi<IRole & { privilegeList?: IPrivilege[] }>("/role/admin", row => ({
  ...row,
  privilegeIdList: row.privilegeList?.map(item => item.id!) ?? row.privilegeIdList ?? []
}));
const remoteUserApi = createApi<IAdminUser>(
  "/user/admin",
  row => ({
    ...row,
    password: "",
    roleList: ((row.roleList as Array<number | IRole>) ?? []).map(item => (typeof item === "number" ? item : item.id!))
  }),
  { userType: 1 }
);
export const privilegeApi: ICrudApi<IPrivilege> = createApi<IPrivilege>("/privilege/admin");
export const roleApi: ICrudApi<IRole> = remoteRoleApi;
export const adminUserApi: ICrudApi<IAdminUser> = {
  getList: remoteUserApi.getList,
  add: remoteUserApi.add,
  edit: ({ password: _password, ...row }) => remoteUserApi.edit(row)
};

export async function getCurrentPermissions(): Promise<string[]> {
  const { data } = await http.get<unknown, IBaseResponse<{ privilegeList: IPrivilege[] }>>("/user/admin/userInfo");
  return data.privilegeList.map(item => item.privilegeKey);
}
// 选项使用分页拉全，避免只读取前 1000 条造成角色/权限静默缺失。
export async function getAllOptions<T>(api: ICrudApi<T>): Promise<T[]> {
  const rows: T[] = [];
  let pageNum = 1;
  while (true) {
    const query: IPageQuery = { pageNum, pageSize: 100 };
    const result = await api.getList(query);
    rows.push(...result.list);
    if (rows.length >= result.total) return rows;
    if (!result.list.length) throw new Error("选项数据不完整，请重试");
    pageNum++;
  }
}

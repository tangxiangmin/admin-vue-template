import type { IExample } from "@/typings/example";
import { ref } from "vue";
import type { ICrudApi } from "@/typings/crud";
import type { IAdminUser, IPrivilege, IRole } from "@/typings/permission";

// 仅内存保存，刷新恢复；不保存账号密码，也不向外部服务发送演示数据。
const keys = [
  "permission.privilege.view",
  "permission.privilege.add",
  "permission.privilege.edit",
  "permission.role.view",
  "permission.role.add",
  "permission.role.edit",
  "permission.user.view",
  "permission.user.add",
  "permission.user.edit",
  "template.example.view",
  "template.example.add",
  "template.example.edit",
  "template.example.remove"
];
const names = [
  "查看权限",
  "新增权限",
  "编辑权限",
  "查看角色",
  "新增角色",
  "编辑角色",
  "查看管理员",
  "新增管理员",
  "编辑管理员",
  "查看示例",
  "新增示例",
  "编辑示例",
  "删除示例"
];
const privileges = ref<IPrivilege[]>(
  keys.map((key, i) => ({
    id: i + 1,
    privilegeKey: key,
    privilegeName: names[i],
    privilegeType: key.endsWith(".view") ? 0 : 1,
    privilegeUrl: "",
    content: "模板内置权限"
  }))
);
const roles = ref<IRole[]>([
  {
    id: 1,
    roleName: "管理员",
    roleKey: "admin",
    description: "模板管理权限",
    privilegeIdList: keys.map((_, i) => i + 1)
  },
  {
    id: 2,
    roleName: "只读用户",
    roleKey: "viewer",
    description: "查看列表",
    privilegeIdList: keys.flatMap((key, i) => (key.endsWith(".view") ? [i + 1] : []))
  }
]);
const users = ref<IAdminUser[]>([
  { id: 1, username: "admin", roleList: [1] },
  { id: 2, username: "user", roleList: [2] }
]);

function createApi<T extends { id?: number }>(rows: { value: T[] }, uniqueKey: keyof T): ICrudApi<T> {
  let nextId = Math.max(0, ...rows.value.map(row => row.id ?? 0)) + 1;
  const copy = (row: T): T => JSON.parse(JSON.stringify(row));
  const check = (row: T) => {
    if (rows.value.some(item => item[uniqueKey] === row[uniqueKey] && item.id !== row.id))
      throw new Error("编码或名称已存在");
  };
  return {
    async getList(query) {
      const filtered = rows.value.filter(row =>
        JSON.stringify(row)
          .toLowerCase()
          .includes((query.keyword ?? "").trim().toLowerCase())
      );
      return {
        list: filtered.slice((query.pageNum - 1) * query.pageSize, query.pageNum * query.pageSize).map(copy),
        total: filtered.length
      };
    },
    async getDetail(id) {
      const record = rows.value.find(row => row.id === id);
      if (!record) throw new Error("记录不存在，请刷新列表");
      return copy(record);
    },
    async add(row) {
      check(row);
      rows.value = [...rows.value, { ...copy(row), id: nextId++ }];
    },
    async edit(row) {
      check(row);
      if (!rows.value.some(item => item.id === row.id)) throw new Error("记录不存在，请刷新列表");
      rows.value = rows.value.map(item => (item.id === row.id ? copy(row) : item));
    },
    async remove(row) {
      rows.value = rows.value.filter(item => item.id !== row.id);
    }
  };
}
const privilegeCrud = createApi(privileges, "privilegeKey");
const roleCrud = createApi(roles, "roleKey");
const userCrud = createApi(users, "username");
export const demoPermission = {
  privilege: { getList: privilegeCrud.getList, add: privilegeCrud.add, edit: privilegeCrud.edit },
  role: { getList: roleCrud.getList, add: roleCrud.add, edit: roleCrud.edit },
  user: {
    getList: userCrud.getList,
    add: (row: IAdminUser) => {
      const { password: _password, ...record } = row;
      return userCrud.add(record);
    },
    edit: (row: IAdminUser) => {
      const { password: _password, ...record } = row;
      return userCrud.edit(record);
    }
  }
};
export function getDemoPermissions(token: string): string[] {
  const username = token === "template-demo-admin" ? "admin" : token === "template-demo-user" ? "user" : "";
  const user = users.value.find(item => item.username === username);
  const ids = roles.value.filter(role => user?.roleList.includes(role.id!)).flatMap(role => role.privilegeIdList);
  return privileges.value.filter(item => ids.includes(item.id!)).map(item => item.privilegeKey);
}

const examples = ref<IExample[]>([{ id: 1, name: "示例记录", status: 1, remark: "复制此页面接入业务接口" }]);
export const demoExampleApi = createApi(examples, "name");

const drawerExamples = ref<IExample[]>([
  { id: 1, name: "示例记录", status: 1, remark: "点击行查看详情，在详情内编辑" },
  { id: 2, name: "待完善记录", status: 0, remark: "编辑时可打开备注选择器" },
  { id: 3, name: "已启用记录", status: 1, remark: "用于切换详情与复制新增" }
]);
export const demoDrawerExampleApi = createApi(drawerExamples, "name");

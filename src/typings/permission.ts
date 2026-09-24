export interface IPrivilege {
  id?: number;
  privilegeName: string;
  privilegeKey: string;
  privilegeType: number;
  privilegeUrl: string;
  content: string;
}
export interface IRole {
  id?: number;
  roleName: string;
  roleKey: string;
  description: string;
  privilegeIdList: number[];
}
export interface IAdminUser {
  id?: number;
  username: string;
  password?: string;
  roleList: number[];
}

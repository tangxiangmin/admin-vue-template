import { defineStore } from "pinia";
import { ref } from "vue";

import type { IUserInfo } from "@/typings/store";

export const useUserStore = defineStore(
  "admin-template-user",
  () => {
    const token = ref<string>("");
    const setToken = (newToken: string) => {
      token.value = newToken;
    };

    const userInfo = ref<IUserInfo>({ name: "" });
    const setUserInfo = (newUserInfo: IUserInfo) => {
      userInfo.value = newUserInfo;
    };

    return {
      token,
      userInfo,
      setToken,
      setUserInfo
    };
  },
  {
    persist: {
      key: "admin-template-user",
      storage: localStorage
    }
  }
);

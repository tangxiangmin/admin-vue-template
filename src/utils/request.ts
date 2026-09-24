import { ElMessage } from "element-plus";
import { setCustomErrorHandlers } from "@/api";
import { LOGIN_URL } from "@/config";
import router from "@/routers";
import { useUserStore } from "@/stores/modules/user";

export function initRequest() {
  setCustomErrorHandlers({
    showError: error => {
      ElMessage.error(error.message);
    },
    async on401(error) {
      const user = useUserStore();
      const requestToken = error.config?.headers.get("x-access-token");
      // 已失效的旧请求不清除后来建立的新会话。
      if (!user.token || requestToken !== user.token) return;
      user.setToken("");
      user.setUserInfo({ name: "" });
      ElMessage.error("登录失效，请重新登录");
      void router.replace(LOGIN_URL);
    }
  });
}

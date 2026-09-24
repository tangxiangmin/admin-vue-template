import { computed } from "vue";
import { useAuthStore } from "@/stores/modules/auth";
export function usePermission(keys: (string | string[])[]) {
  const auth = useAuthStore();
  return keys.map(key => computed(() => auth.hasPermission(key)));
}

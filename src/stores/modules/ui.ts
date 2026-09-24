import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("admin-template-ui", () => {
  const themeDrawerVisible = ref(false);

  return {
    themeDrawerVisible
  };
});

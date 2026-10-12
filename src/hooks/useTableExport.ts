import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { IListColumn } from "@/typings/query";
// CSV 由本地 Blob 下载；防止单元格内容被电子表格作为公式执行。
export function useTableExport<T>() {
  const exporting = ref(false);
  const cell = (value: unknown) => {
    const text = String(value ?? "");
    const safe = /^[=+@\-\t\r\n]/.test(text.trimStart()) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  async function exportData(fileName: string, columns: IListColumn<T>[], load: () => Promise<T[]>) {
    if (exporting.value) return;
    exporting.value = true;
    try {
      const rows = await load();
      const visible = columns.filter(column => !column.hidden);
      const lines = [
        visible.map(column => cell(column.label)).join(","),
        ...rows.map(row => visible.map(column => cell(column.format ? column.format(row) : row[column.key])).join(","))
      ];
      const url = URL.createObjectURL(new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      ElMessage.error(err instanceof Error ? err.message : "导出失败");
    } finally {
      exporting.value = false;
    }
  }
  return { exporting, exportData };
}

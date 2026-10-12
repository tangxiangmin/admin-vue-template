import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { encodeQueryParams } from "@/utils/queryParams";
import { useSearchStore } from "@/hooks/useSearchStore";
import type { IPageQuery, IPageResult } from "@/typings/crud";
import type { IListQueryOptions } from "@/typings/query";
import type { TSearchStoreOptions } from "@/typings/search";
interface IQueryRequestOptions<T> {
  request: (query: IPageQuery) => Promise<IPageResult<T>>;
  query?: IListQueryOptions;
  searchStoreOptions?: () => TSearchStoreOptions | undefined;
}
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export function useQueryListRequest<T>(options: IQueryRequestOptions<T>) {
  const route = useRoute(),
    router = useRouter();
  const inbound = options.query?.inboundQuery;
  const inboundSnapshot = inbound
    ? Object.fromEntries(inbound.keys.filter(key => route.query[key] !== undefined).map(key => [key, route.query[key]]))
    : {};
  const defaults = (): IPageQuery => ({ pageNum: 1, pageSize: 20, keyword: "", ...options.query?.initialParams });
  function validate(value: unknown): value is IPageQuery {
    if (!value || typeof value !== "object") return false;
    const q = value as IPageQuery;
    return (
      Number.isSafeInteger(q.pageNum) &&
      q.pageNum > 0 &&
      [10, 20, 50, 100].includes(q.pageSize) &&
      (q.keyword === undefined || typeof q.keyword === "string") &&
      (q.keywordSearch == null ||
        (typeof q.keywordSearch === "object" &&
          typeof q.keywordSearch.keyword === "string" &&
          Array.isArray(q.keywordSearch.fields) &&
          q.keywordSearch.fields.length > 0 &&
          q.keywordSearch.fields.every(field => field === "name" || field === "code"))) &&
      (q.status === undefined || q.status === 0 || q.status === 1) &&
      (q.groupIds === undefined ||
        (Array.isArray(q.groupIds) && q.groupIds.every(id => Number.isSafeInteger(id) && id > 0))) &&
      (q.timeRange == null ||
        (Array.isArray(q.timeRange) &&
          q.timeRange.length === 2 &&
          q.timeRange.every(v => typeof v === "string" && Number.isFinite(Date.parse(v))) &&
          q.timeRange[0] <= q.timeRange[1])) &&
      (q.orderBy === undefined || Boolean(options.query?.sortableKeys?.includes(q.orderBy))) &&
      (q.order === undefined || q.order === "ascending" || q.order === "descending")
    );
  }
  const store = useSearchStore<IPageQuery>({ defaults, validate, options: () => options.searchStoreOptions?.() });
  const draft = reactive<IPageQuery>(clone(store.restored.value));
  const requestParams = shallowRef<IPageQuery>(clone(draft));
  const list = shallowRef<T[]>([]);
  const total = ref(0),
    loading = ref(false),
    error = ref("");
  let requestId = 0,
    initialized = false,
    initializing = false,
    alive = true;
  let initialDefaults = defaults();
  const replaceDraft = (query: IPageQuery) => {
    Object.keys(draft).forEach(key => delete (draft as unknown as Record<string, unknown>)[key]);
    Object.assign(draft, clone(query));
  };
  async function getList(): Promise<void> {
    if (!initialized) {
      await initialize();
      return;
    }
    const id = ++requestId;
    const params = clone(requestParams.value);
    loading.value = true;
    error.value = "";
    try {
      await store.set(params);
      if (id !== requestId) return;
      const result = await options.request(encodeQueryParams(params));
      if (id !== requestId) return;
      list.value = result.list;
      total.value = result.total;
      const last = Math.max(1, Math.ceil(total.value / params.pageSize));
      if (params.pageNum > last) await apply({ pageNum: last });
    } catch (err) {
      if (id === requestId) {
        list.value = [];
        total.value = 0;
        error.value = err instanceof Error ? err.message : "列表加载失败";
      }
    } finally {
      if (id === requestId) loading.value = false;
    }
  }
  async function apply(patch: Partial<IPageQuery> = {}) {
    const params = { ...requestParams.value, ...patch };
    if (!validate(params)) {
      error.value = "查询参数无效，请检查日期范围和排序字段";
      return;
    }
    requestParams.value = clone(params);
    replaceDraft(params);
    if (initialized) await getList();
  }
  const search = () => apply({ ...clone(draft), keyword: draft.keyword?.trim(), pageNum: 1 });
  function reset() {
    const preserved = Object.fromEntries(
      (options.query?.preserveOnReset ?? []).map(key => [key, requestParams.value[key]])
    );
    replaceDraft({ ...clone(initialDefaults), ...preserved });
    return search();
  }
  const changeCurrent = (pageNum: number) => apply({ pageNum });
  const changeSize = (pageSize: number) => apply({ pageSize, pageNum: 1 });
  const changeSorter = ({ prop, order }: { prop?: string; order?: "ascending" | "descending" | null }) =>
    apply({ orderBy: order ? prop : undefined, order: order ?? undefined, pageNum: 1 });
  watch(store.restored, query => {
    requestParams.value = clone(query);
    replaceDraft(query);
    if (initialized) void getList();
  });
  async function initialize(): Promise<void> {
    if (initializing || !alive) return;
    initializing = true;
    loading.value = true;
    error.value = "";
    try {
      const patches = await Promise.all((options.query?.initialPartialParamsFns ?? []).map(fn => fn()));
      if (!alive) return;
      initialDefaults = { ...defaults(), ...Object.assign({}, ...patches), ...options.query?.initialParams };
      // 有已保存查询时优先恢复；首屏初值解析完成后只请求一次。
      const restored = store.restored.value;
      const params = { ...(store.hasStored.value ? restored : initialDefaults), ...inbound?.decode(inboundSnapshot) };
      if (!validate(params)) throw new Error("列表初始参数无效");
      requestParams.value = clone(params);
      replaceDraft(params);
      if (inbound && Object.keys(inboundSnapshot).length) {
        const query = { ...route.query };
        inbound.keys.forEach(key => delete query[key]);
        const failure = await router.replace({ path: route.path, query, hash: route.hash });
        if (failure) throw new Error("入站查询参数迁移被阻止");
      }
      initialized = true;
      await getList();
    } catch (err) {
      if (alive) error.value = err instanceof Error ? err.message : "查询初始化失败";
    } finally {
      initializing = false;
      if (!initialized && alive) loading.value = false;
    }
  }
  onMounted(initialize);
  onBeforeUnmount(() => {
    alive = false;
    requestId++;
  });
  return {
    draft,
    requestParams,
    list,
    total,
    loading,
    error,
    storageError: store.storageError,
    page: computed(() => requestParams.value.pageNum),
    pageSize: computed(() => requestParams.value.pageSize),
    keyword: computed({
      get: () => draft.keyword ?? "",
      set: value => {
        draft.keyword = value;
      }
    }),
    getList,
    apply,
    search,
    reset,
    changeCurrent,
    changeSize,
    changeSorter
  };
}

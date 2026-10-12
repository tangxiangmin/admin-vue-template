export type TSearchStoreOptions =
  | { type?: "url"; key?: string }
  | { type: "sessionStorage" | "memory"; key: string }
  | { type: "none" };

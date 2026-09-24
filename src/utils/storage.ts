import { StorageSerializers } from "@vueuse/core";

interface IStorageCodecOptions<T> {
  defaults: () => T;
  validate: (value: unknown) => value is T;
  onError?: (error: unknown) => void;
}
interface IStorageModelOptions<T> extends IStorageCodecOptions<T> {
  storage?: () => Storage;
}

// 仅处理 JSON 数据；解析失败回到独立默认值，写入失败向调用方抛出。
export function createStorageSerializer<T>(options: IStorageCodecOptions<T>) {
  return {
    read(raw: string): T {
      try {
        const value: unknown = StorageSerializers.object.read(raw);
        if (!options.validate(value)) throw new Error("缓存结构不匹配，已使用默认值");
        return value;
      } catch (error) {
        options.onError?.(error);
        return options.defaults();
      }
    },
    write(value: T): string {
      if (!options.validate(value)) throw new Error("数据结构不匹配，无法保存");
      return StorageSerializers.object.write(value);
    }
  };
}

export function createStorageModel<T>(key: string, options: IStorageModelOptions<T>) {
  const storage = options.storage ?? (() => window.localStorage);
  const serializer = createStorageSerializer(options);
  function get(): T {
    try {
      const raw = storage().getItem(key);
      return raw === null ? options.defaults() : serializer.read(raw);
    } catch (error) {
      options.onError?.(error);
      return options.defaults();
    }
  }
  function set(value: T) {
    storage().setItem(key, serializer.write(value));
  }
  function remove() {
    storage().removeItem(key);
  }
  function update(updater: (value: T) => T): T {
    const value = updater(get());
    set(value);
    return value;
  }
  return { key, get, set, remove, update };
}

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { useUserStore } from "@/stores/modules/user";

import type { IBaseResponse } from "@/typings/api";

interface IErrorHandlers {
  showError: (error: Error) => void;
  on401: (error: AxiosError, service: AxiosInstance) => Promise<void>;
}

const errorHandlers: IErrorHandlers = {
  showError: () => {},
  on401: async () => {}
};

export function setCustomErrorHandlers(handlers: Partial<IErrorHandlers>) {
  Object.assign(errorHandlers, handlers);
}

function createService(config: AxiosRequestConfig, customError = false) {
  const service = axios.create(config);
  let unauthorizedTask: Promise<void> | undefined;

  async function rejectUnauthorized(error: AxiosError): Promise<never> {
    unauthorizedTask ??= Promise.resolve().then(() => errorHandlers.on401(error, service));
    const task = unauthorizedTask;
    try {
      await task;
    } finally {
      if (unauthorizedTask === task) unauthorizedTask = undefined;
    }
    throw error;
  }

  service.interceptors.request.use(request => {
    const token = useUserStore().token;
    if (token) request.headers.set("x-access-token", token);
    else request.headers.delete("x-access-token");
    return request;
  });

  service.interceptors.response.use(
    async response => {
      let data = response.data;
      const isBinary = data instanceof Blob || data instanceof ArrayBuffer;
      if (isBinary) {
        const contentType = String(response.headers["content-type"] || (data instanceof Blob ? data.type : ""));
        if (!contentType.includes("json")) return data;
        const text = data instanceof Blob ? await data.text() : new TextDecoder().decode(data);
        try {
          data = JSON.parse(text);
        } catch {
          const error = new Error("服务器返回了无效的 JSON 响应");
          if (!customError) errorHandlers.showError(error);
          throw error;
        }
        response.data = data;
      }
      if (Number(data?.code) === 401) {
        return rejectUnauthorized(
          new AxiosError(
            data.msg || "登录失效，请重新登录",
            "ERR_UNAUTHORIZED",
            response.config,
            response.request,
            response
          )
        );
      }
      if (Number(data?.code) !== 200) {
        const error = new AxiosError(
          data?.msg || "请求失败",
          "ERR_BAD_RESPONSE",
          response.config,
          response.request,
          response
        );
        if (!customError) errorHandlers.showError(error);
        return Promise.reject(error);
      }
      if (response.config.responseType === "blob" || response.config.responseType === "arraybuffer") {
        const error = new Error("服务器未返回文件内容");
        if (!customError) errorHandlers.showError(error);
        throw error;
      }
      return response.data;
    },
    (error: unknown) => {
      if (axios.isCancel(error)) return Promise.reject(error);
      if (!axios.isAxiosError<IBaseResponse>(error)) return Promise.reject(error);
      if (error.response?.status === 401) return rejectUnauthorized(error);
      if (error.response?.data?.msg) error.message = error.response.data.msg;
      else if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") error.message = "请求超时，请稍后重试";
      else if (error.code === "ERR_NETWORK") error.message = "网络错误，请稍后重试";
      if (!customError) errorHandlers.showError(error);
      return Promise.reject(error);
    }
  );
  return service;
}

const config: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  withCredentials: true
};

// 页面自行展示错误时使用，业务失败仍会拒绝 Promise。
export const customErrorService = createService(config, true);
export default createService(config);

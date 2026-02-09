import { getData, setData } from "@/utils";
import { toast } from "sonner";

const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}-auth-v${import.meta.env.VITE_APP_VERSION}`;
const API_URL = import.meta.env.VITE_API_BASE_URL + "/auth";
const REFRESH_URL = API_URL + "/refresh-token";

const getAuth = () => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY);
    if (auth) {
      return auth;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
  }
};
const setAuth = (auth) => {
  setData(AUTH_LOCAL_STORAGE_KEY, auth);
};
const removeAuth = () => {
  if (!localStorage) {
    return;
  }
  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE REMOVE ERROR", error);
  }
};
export function setupAxios(axios) {
  axios.defaults.headers.Accept = "application/json";
  axios.defaults.baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  axios.interceptors.request.use(
    (config) => {
      const auth = getAuth();
      if (auth?.accessToken) {
        config.headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => {
      // 自动解包 data 属性，兼容新后端 { success, data } 格式
      if (response.data && response.data.data !== undefined) {
        response.data = response.data.data;
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // 如果是 401，但请求地址是 /auth/login，说明是用户登录失败的情况，
      // 不需要走刷新逻辑，直接把错误抛给前端
      if (
        error.response?.status === 401 &&
        originalRequest.url.includes("/auth/login")
      ) {
        return Promise.reject(error);
      }

      // 处理401错误且不是刷新token的请求
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/refresh")
      ) {
        originalRequest._retry = true;

        try {
          const auth = getAuth();
          const newAuth = await axios.post(REFRESH_URL, {
            refreshToken: auth?.refreshToken,
          });

          const newAccessToken = newAuth.data.accessToken;
          const mergedAuth = {
            ...auth, // 保留旧的 refreshToken 等其它字段
            accessToken: newAccessToken,
          };
          setAuth(mergedAuth);
          originalRequest.headers.Authorization = `Bearer ${newAuth.data.accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          removeAuth();
          window.location.href = "/auth/login";
          return Promise.reject(refreshError);
        }
      }

      // 把后端 { error: { message } } 中的真实错误提升到 data.message
      // 这样所有下游 catch 块读 err.response?.data?.message 就能拿到真实错误
      if (error.response?.data && !error.response.data.message) {
        const errField = error.response.data.error;
        if (errField) {
          error.response.data.message =
            typeof errField === 'string' ? errField : errField.message;
        }
      }
      // 不在拦截器弹 toast，由各页面自行处理（避免重复）
      return Promise.reject(error);
    }
  );
}
export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };

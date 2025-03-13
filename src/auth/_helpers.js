import { getData, setData } from "@/utils";
import { toast } from "sonner";

const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}-auth-v${import.meta.env.VITE_APP_VERSION}`;
const API_URL = import.meta.env.VITE_API_BASE_URL + "/auth";
const REFRESH_URL = API_URL + "/refresh";

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
    (response) => response,
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

      // 错误处理
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred");
      }
      return Promise.reject(error);
    }
  );
}
export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };

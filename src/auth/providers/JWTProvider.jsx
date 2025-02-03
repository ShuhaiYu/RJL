/* eslint-disable no-unused-vars */
import axios from 'axios';
import { createContext, useState, useEffect } from 'react';
import * as authHelper from '../_helpers';
const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth';
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/user`;
export const REFRESH_URL = `${API_URL}/refresh`;

const AuthContext = createContext(null);
const AuthProvider = ({
  children
}) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState();
  const verify = async () => {    
    if (auth) {
      try {
        const {
          data: user
        } = await getUser(auth.email);
        setCurrentUser(user);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };
  const saveAuth = auth => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };
  const login = async (email, password) => {
    try {
      const {
        data: auth
      } = await axios.post(LOGIN_URL, {
        email,
        password
      });
      saveAuth(auth);
      const {
        data: user
      } = await getUser(email);
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };
  const register = async (email, password, password_confirmation) => {
    try {
      const {
        data: auth
      } = await axios.post(REGISTER_URL, {
        email,
        password,
        password_confirmation
      });
      saveAuth(auth);
      const {
        data: user
      } = await getUser(email);
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };
  const requestPasswordResetLink = async email => {
    await axios.post(FORGOT_PASSWORD_URL, {
      email
    });
  };
  const changePassword = async (email, token, password, password_confirmation) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation
    });
  };
  const getUser = async (email) => {
    return await axios.post(GET_USER_URL, {email});
  };
  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  const refreshToken = async () => {
    try {
      // 假设 auth 中保存了 refresh_token 字段
      const { data } = await axios.post(REFRESH_URL, { refreshToken: auth.refreshToken });
      // 更新 auth 信息（包含新的 access_token 和 refresh_token）
      saveAuth(data);
      return data.access_token;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // 在 Provider 内部设置 axios 拦截器，当遇到 401 时自动刷新 token
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            // 调用 refreshToken 方法获取新的 access_token
            const newAccessToken = await refreshToken();
            // 更新 axios 默认 header（后续请求会自动带上新 token）
            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );
    // 清理拦截器（防止重复添加）
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [auth]); // 注意：当 auth 变化时更新拦截器

  return <AuthContext.Provider value={{
    loading,
    setLoading,
    auth,
    saveAuth,
    currentUser,
    setCurrentUser,
    login,
    register,
    requestPasswordResetLink,
    changePassword,
    getUser,
    logout,
    verify
  }}>
      {children}
    </AuthContext.Provider>;
};
export { AuthContext, AuthProvider };
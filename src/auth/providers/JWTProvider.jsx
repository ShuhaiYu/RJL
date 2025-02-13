/* eslint-disable no-unused-vars */
import axios from 'axios';
import { createContext, useState, useEffect, useMemo } from 'react';
import * as authHelper from '../_helpers';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth';
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/me`;
export const REFRESH_URL = `${API_URL}/refresh`;

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  // 从本地存储中获取已保存的 auth 信息
  const [auth, setAuth] = useState(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState();

  /**
   * 根据传入的 token 请求当前用户信息
   * @param {string} token - 用户的 accessToken
   * @returns {Promise<Object>} - 返回用户信息对象
   */
  const getUser = async (token) => {


    try {
      const response = await axios.get(GET_USER_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('getUser error:', error);
      throw error;
    }
  };

  /**
   * 验证当前是否有有效的 token，并获取用户信息
   */
  const verify = async () => {
    if (auth && auth.accessToken) {
      try {
        const user = await getUser(auth.accessToken);
        setCurrentUser(user);
      } catch (error) {
        console.error('verify error:', error);
        // 出现错误时清除 auth 信息
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  /**
   * 保存 auth 信息到 state 及 localStorage（或其他存储方式）
   * @param {Object|undefined} authData - 登录成功返回的 auth 数据
   */
  const saveAuth = (authData) => {
    setAuth(authData);
    if (authData) {
      authHelper.setAuth(authData);
    } else {
      authHelper.removeAuth();
    }
  };

  /**
   * 登录：先调用 /login 接口获取 token，再使用 token 请求 /me 获取用户信息
   * @param {string} email 
   * @param {string} password 
   */
  const login = async (email, password) => {
    try {
      // 调用登录接口获取 token 等信息
      const { data: authData } = await axios.post(LOGIN_URL, { email, password });
      // 保存 token 信息
      saveAuth(authData);

      // 使用返回的 token 请求用户信息
      const user = await getUser(authData.accessToken);
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      console.error('login error:', error);
      throw new Error(`Error ${error}`);
    }
  };

  /**
   * 注册：调用注册接口后，保存 token 信息并获取用户信息
   * @param {string} email 
   * @param {string} password 
   * @param {string} password_confirmation 
   */
  const register = async (email, password, password_confirmation) => {
    try {
      const { data: authData } = await axios.post(REGISTER_URL, { email, password, password_confirmation });
      saveAuth(authData);

      // 使用返回的 token 获取用户信息
      const user = await getUser(authData.accessToken);
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      console.error('register error:', error);
      throw new Error(`Error ${error}`);
    }
  };

  /**
   * 请求密码重置链接
   * @param {string} email 
   */
  const requestPasswordResetLink = async (email) => {
    await axios.post(FORGOT_PASSWORD_URL, { email });
  };

  /**
   * 更改密码（通过重置链接中的 token）
   * @param {string} email 
   * @param {string} token 
   * @param {string} password 
   * @param {string} password_confirmation 
   */
  const changePassword = async (email, token, password, password_confirmation) => {
    await axios.post(RESET_PASSWORD_URL, { email, token, password, password_confirmation });
  };

  /**
   * 登出：清除 auth 信息和当前用户信息
   */
  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  /**
   * 刷新 token
   * @returns {Promise<string>} - 返回新的 accessToken
   */
  const refreshToken = async () => {
    try {
      // auth 中包含 refreshToken 字段
      const { data } = await axios.post(REFRESH_URL, { refreshToken: auth.refreshToken }
      )
      // 更新 auth 信息（包括新的 accessToken 和 refreshToken）
      saveAuth(data);
      return data.accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  /**
   * Axios 拦截器：当遇到 401 错误时自动刷新 token 并重试原请求
   */
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await refreshToken();
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
    // 在组件卸载或 auth 变化时移除拦截器，防止重复添加
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [auth]);

  // 计算基础 API 路径，根据 currentUser.role 返回一个 base URL 字符串
  const baseApi = useMemo(() => {
    if (currentUser && currentUser.role) {
      switch (currentUser.role) {
        case "superuser":
          return `${import.meta.env.VITE_API_BASE_URL}/superuser`;
        case "admin":
          return `${import.meta.env.VITE_API_BASE_URL}/admin`;
        case "agency-admin":
          return `${import.meta.env.VITE_API_BASE_URL}/agency/admin`;
        case "agency-user":
          return `${import.meta.env.VITE_API_BASE_URL}/agency/user`;
        default:
          return `${import.meta.env.VITE_API_BASE_URL}`;
      }
    }
    return `${import.meta.env.VITE_API_BASE_URL}`;
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
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
        verify,
        baseApi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

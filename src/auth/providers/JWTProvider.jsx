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

// 用于处理刷新Token的队列和状态
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
    if (!auth?.accessToken) {
      setCurrentUser(undefined);
      return;
    }

    try {
      const user = await getUser(auth.accessToken);
      setCurrentUser(user);
    } catch (error) {
      // if (error.response?.status === 401 && auth.refreshToken) {
      //   try {
      //     const newAuth = await refreshToken();
      //     const user = await getUser(newAuth.accessToken);
      //     setCurrentUser(user);
      //   } catch (refreshError) {
      //     console.error('Refresh failed:', refreshError);
      //     logout();
      //   }
      // } else {
      //   logout();
      // }
      console.log('verify error:', error);
      logout();
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
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(REFRESH_URL, { 
        refreshToken: auth?.refreshToken 
      });
      
      const newAuth = {
        ...auth,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken // 确保更新refreshToken
      };
      
      saveAuth(newAuth);
      processQueue(null, newAuth.accessToken);
      return newAuth;
    } catch (error) {
      processQueue(error, null);
      logout();
      throw error;
    } finally {
      isRefreshing = false;
    }
  };

  const baseApi = `${import.meta.env.VITE_API_BASE_URL}/api`;

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

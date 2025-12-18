import '@/components/keenicons/assets/styles.css';
import './styles/globals.css';

import axios from 'axios';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { setupAxios } from './auth';
import { ProvidersWrapper } from './providers';
import React from 'react';

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios);
const root = ReactDOM.createRoot(document.getElementById('root'));
// React.StrictMode 在开发模式会导致所有 useEffect 执行两次
// 生产环境不受影响，这里开发环境也禁用以避免重复 API 请求
root.render(
  <ProvidersWrapper>
    <App />
  </ProvidersWrapper>
);
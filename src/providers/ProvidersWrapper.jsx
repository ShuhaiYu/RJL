import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/auth/providers/JWTProvider';
import { LayoutProvider, LoadersProvider, MenusProvider, SettingsProvider, TranslationProvider } from '@/providers';
import { HelmetProvider } from 'react-helmet-async';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟内数据保持新鲜，不重新请求
      retry: 1,
      refetchOnWindowFocus: false, // 窗口聚焦时不自动重新请求
    },
  },
});
const ProvidersWrapper = ({
  children
}) => {
  return <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TranslationProvider>
            <HelmetProvider>
              <LayoutProvider>
                <LoadersProvider>
                  <MenusProvider>{children}</MenusProvider>
                </LoadersProvider>
              </LayoutProvider>
            </HelmetProvider>
          </TranslationProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>;
};
export { ProvidersWrapper };
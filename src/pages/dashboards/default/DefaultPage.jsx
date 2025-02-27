import { useLayout } from '@/providers';
import { Demo1LightSidebarPage } from '../demo1/light-sidebar';
const DefaultPage = () => {
  const {
    currentLayout
  } = useLayout();
  if (currentLayout?.name === 'demo1-layout') {
    return <Demo1LightSidebarPage />;
  }
};
export { DefaultPage };
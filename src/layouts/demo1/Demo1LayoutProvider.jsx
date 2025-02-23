/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useMenuChildren } from "@/components/menu";
import { MENU_SIDEBAR } from "@/config/menu.config";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { demo1LayoutConfig } from "./";
import { AuthContext } from "@/auth/providers/JWTProvider";

// 判断用户是否有权限
const hasPermission = (userPermissions, menuPermissions) => {
  if (!menuPermissions) return true;

  return Object.entries(menuPermissions).some(([scope, actions]) => {
    return (
      userPermissions[scope] &&
      actions.some((action) => userPermissions[scope].includes(action))
    );
  });
};

// 初始化 Layout 配置
const initalLayoutProps = {
  layout: demo1LayoutConfig,
  // Default layout configuration
  megaMenuEnabled: false,
  // Mega menu disabled by default
  headerSticky: false,
  // Header is not sticky by default
  mobileSidebarOpen: false,
  // Mobile sidebar is closed by default
  mobileMegaMenuOpen: false,
  // Mobile mega menu is closed by default
  sidebarMouseLeave: false,
  // Sidebar mouse leave is false initially
  setSidebarMouseLeave: (state) => {
    console.log(`${state}`);
  },
  setMobileMegaMenuOpen: (open) => {
    console.log(`${open}`);
  },
  setMobileSidebarOpen: (open) => {
    console.log(`${open}`);
  },
  setMegaMenuEnabled: (enabled) => {
    console.log(`${enabled}`);
  },
  setSidebarCollapse: (collapse) => {
    console.log(`${collapse}`);
  },
  setSidebarTheme: (mode) => {
    console.log(`${mode}`);
  },
};

// Creating context for the layout provider with initial properties
const Demo1LayoutContext = createContext(initalLayoutProps);

// Custom hook to access the layout context
const useDemo1Layout = () => useContext(Demo1LayoutContext);

// Layout provider component that wraps the application
const Demo1LayoutProvider = ({ children }) => {
  const { pathname } = useLocation();
  const { setMenuConfig } = useMenus();
  const { currentUser, loading } = useContext(AuthContext); // 获取当前用户信息
  const { getLayout, updateLayout, setCurrentLayout } = useLayout();

  // **1. 确保 userPermissions 存在，且等 loading 完成**
  useEffect(() => {
    if (loading || !currentUser) return; // **如果还在加载，先不更新菜单**

    const userPermissions = currentUser.permissions || {};

    // **2. 过滤菜单**
    const filteredMenu = MENU_SIDEBAR.map((item) => {
      // 如果存在 children，则先对子菜单项进行过滤
      if (item.children && Array.isArray(item.children)) {
        const filteredChildren = item.children.filter((child) =>
          child.permissions
            ? hasPermission(userPermissions, child.permissions)
            : true
        );
        return { ...item, children: filteredChildren };
      }
      return item;
    }).filter((item) => {
      // 如果当前菜单项本身有权限限制，则检查是否符合要求
      if (item.permissions) {
        return hasPermission(userPermissions, item.permissions);
      }
      // 如果存在 children，则只有子菜单有内容时才保留
      if (item.children) {
        return item.children.length > 0;
      }
      // 没有权限限制的项默认保留（例如仅为 heading 的菜单项）
      return true;
    });

    // **3. 处理 secondaryMenu**
    const secondaryMenu = useMenuChildren(pathname, filteredMenu, 0);

    // **4. 更新菜单**
    setMenuConfig("primary", filteredMenu);
    setMenuConfig("secondary", secondaryMenu);
  }, [currentUser, loading, pathname]);

  // 获取 Layout 配置
  // Merges the default layout with the current one
  const getLayoutConfig = () => {
    return deepMerge(demo1LayoutConfig, getLayout(demo1LayoutConfig.name));
  };
  const [layout, setLayout] = useState(getLayoutConfig); // State for layout configuration

  // Updates the current layout when the layout state changes
  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);
  const [megaMenuEnabled, setMegaMenuEnabled] = useState(false); // State for mega menu toggle

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // State for mobile sidebar

  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false); // State for mobile mega menu

  const [sidebarMouseLeave, setSidebarMouseLeave] = useState(false); // State for sidebar mouse leave

  const scrollPosition = useScrollPosition(); // Tracks the scroll position

  const headerSticky = scrollPosition > 0; // Makes the header sticky based on scroll

  // Function to collapse or expand the sidebar
  const setSidebarCollapse = (collapse) => {
    const updatedLayout = {
      options: {
        sidebar: {
          collapse,
        },
      },
    };
    updateLayout(demo1LayoutConfig.name, updatedLayout); // Updates the layout with the collapsed state
    setLayout(getLayoutConfig()); // Refreshes the layout configuration
  };

  // Function to set the sidebar theme (e.g., light or dark)
  const setSidebarTheme = (mode) => {
    const updatedLayout = {
      options: {
        sidebar: {
          theme: mode,
        },
      },
    };
    setLayout(deepMerge(layout, updatedLayout)); // Merges and sets the updated layout
  };
  return (
    // Provides the layout configuration and controls via context to the application
    <Demo1LayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        mobileMegaMenuOpen,
        megaMenuEnabled,
        sidebarMouseLeave,
        setMobileSidebarOpen,
        setMegaMenuEnabled,
        setSidebarMouseLeave,
        setMobileMegaMenuOpen,
        setSidebarCollapse,
        setSidebarTheme,
      }}
    >
      {children}
    </Demo1LayoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { Demo1LayoutProvider, useDemo1Layout };

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const PathnameContext = createContext(undefined);
const PathnameProvider = ({
  children
}) => {
  const {
    pathname,
    search
  } = useLocation();
  const [prevPathname, setPrevPathname] = useState(undefined);
  const fullPath = pathname + search;
  useEffect(() => {
    setPrevPathname(() => {
      return fullPath;
    });
  }, [fullPath]);
  return <PathnameContext.Provider value={{
    pathname,
    search,
    fullPath,
    prevPathname
  }}>
      {children}
    </PathnameContext.Provider>;
};
const usePathname = () => {
  const context = useContext(PathnameContext);
  if (!context) {
    throw new Error('usePathname must be used within a PathnameProvider');
  }
  return context;
};
export { PathnameProvider, usePathname };
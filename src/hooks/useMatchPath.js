import { matchPath, useLocation } from 'react-router-dom';
const useMatchPath = (path, mode = 'default') => {
  const {
    pathname,
    search
  } = useLocation();

  // Combine pathname and search for full URL comparison
  const fullPath = pathname + search;

  let match = false;

  // Check if path contains query string
  const menuHasQuery = path.includes('?');
  const urlHasQuery = search.length > 0;

  if (menuHasQuery) {
    // For menu paths with query string, compare full path exactly
    match = fullPath === path;
  } else if (!urlHasQuery) {
    // For menu paths without query string, only match if URL also has no query string
    if (mode === 'default' && matchPath({
      path,
      end: true
    }, pathname)) {
      match = true;
    } else if (mode === 'full' && matchPath({
      path,
      end: false
    }, pathname)) {
      match = true;
    }
  }
  // If menu has no query but URL has query, don't match (match = false)

  return {
    match,
    isExternal: path.startsWith('http') || path.startsWith('//')
  };
};
export { useMatchPath };
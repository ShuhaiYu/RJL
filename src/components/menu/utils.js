import { Children, isValidElement } from 'react';
import { MenuLink } from './MenuLink';
import { matchPath } from 'react-router';
export const getMenuLinkPath = children => {
  let path = '';
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === MenuLink && child.props.path) {
      path = child.props.path; // Assign the path when found
    }
  });
  return path;
};
export const hasMenuActiveChild = (fullPath, children) => {
  const childrenArray = Children.toArray(children);
  // Extract pathname and check if URL has query string
  const [pathname, search] = fullPath.split('?');
  const urlHasQuery = search !== undefined && search.length > 0;

  for (const child of childrenArray) {
    if (isValidElement(child)) {
      if (child.type === MenuLink && child.props.path) {
        const childPath = child.props.path;
        const menuHasQuery = childPath.includes('?');

        if (menuHasQuery) {
          // For menu paths with query string, compare exactly
          if (fullPath === childPath) {
            return true;
          }
        } else if (!urlHasQuery) {
          // For menu paths without query, only match if URL also has no query
          if (pathname === '/') {
            if (childPath === pathname) {
              return true;
            }
          } else {
            if (matchPath(childPath, pathname)) {
              return true;
            }
          }
        }
        // If menu has no query but URL has query, don't match
      } else if (hasMenuActiveChild(fullPath, child.props.children)) {
        return true;
      }
    }
  }
  return false;
};
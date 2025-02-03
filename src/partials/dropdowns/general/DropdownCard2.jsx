import { KeenIcon, MenuIcon, MenuItem, MenuLink, MenuSub, MenuTitle } from '@/components';
const DropdownCard2 = ({ onDelete }) => {
  return <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem path="/account/home/settings-enterprise">
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="setting-3" />
          </MenuIcon>
          <MenuTitle>Settings</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem onClick={(e) => {
            e.preventDefault(); // 阻止默认跳转
            if (typeof onDelete === 'function') {
              onDelete();
            }
          }}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="trash" />
          </MenuIcon>
          <MenuTitle>Delete</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>;
};
export { DropdownCard2 };
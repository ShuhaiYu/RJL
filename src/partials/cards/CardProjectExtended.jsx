import { KeenIcon, Menu, MenuItem, MenuToggle } from "@/components";
import { toAbsoluteUrl } from "@/utils/Assets";
import { useLanguage } from "@/i18n";
import { DropdownCard2 } from "../dropdowns/general";
import { CommonAvatars } from "../common";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const CardProjectExtended = ({
  id,
  // status,
  logo,
  title,
  description,
  // team,
  // statistics,
  // progress,
  url,
  onRemove,
}) => {
  const { isRTL } = useLanguage();

  // 从 useAuthContext 中取出 token & currentUser
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const currentUserRole = currentUser?.role;
  
  // 删除操作
  const handleDelete = async () => {
    try {
      // 注意你用的是 DELETE /agencies/:id
      await axios.delete(`${baseApi}/agencies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast("Agency deleted successfully!", {
        appearance: "success",
        autoDismiss: true,
      });

      if (typeof onRemove === "function") {
        onRemove(id);
      }
    } catch (error) {
      console.error("Failed to delete agency:", error);
      toast("Failed to delete the agency.", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div className="card overflow-hidden grow justify-between">
      <div className="p-5 mb-5">
        <div className="flex items-center justify-between mb-5">
          {/* 如果你有 status，就写这里 */}
          {/* <span className={`badge ${status.variant} badge-outline`}> */}
          {/*   {status.label} */}
          {/* </span> */}

          {/* 只有 superuser 才显示该 Menu */}
          {currentUserRole === "superuser" && (
            <Menu className="items-stretch">
              <MenuItem
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: isRTL() ? "bottom-start" : "bottom-end",
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
                      },
                    },
                  ],
                }}
              >
                <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                  <KeenIcon icon="dots-vertical" />
                </MenuToggle>
                {DropdownCard2({ onDelete: handleDelete })}
              </MenuItem>
            </Menu>
          )}
        </div>

        {/* 链接主体（图片 + 标题 + 描述） */}
        <Link to={url} className="flex flex-col items-center text-center gap-2">
          {/* 图片 */}
          <img src={logo} className="min-w-12 shrink-0" alt="" />
          {/* 标题 */}
          <span className="text-lg font-medium text-gray-900 hover:text-primary">
            {title}
          </span>
          {/* 描述 */}
          <span className="text-sm text-gray-700">{description}</span>
        </Link>
      </div>
    </div>
  );
};

export { CardProjectExtended };

import { useAuthContext } from "@/auth";
import { FormattedMessage } from "react-intl";

const HeaderTopbar = () => {
  const { logout } = useAuthContext();
  return (
    <div className="flex items-center justify-end p-4">
      <a onClick={logout} className="btn btn-sm btn-light justify-center cursor-pointer">
        <FormattedMessage id="USER.MENU.LOGOUT" />
      </a>
    </div>
  );
};

export { HeaderTopbar };

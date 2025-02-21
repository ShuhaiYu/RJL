import { Link } from "react-router-dom";
import { KeenIcon } from "@/components/keenicons";
import { toAbsoluteUrl } from "@/utils";
import { useDemo1Layout } from "../";
import { useAuthContext } from "@/auth";

const HeaderLogo = () => {
  const { setMobileSidebarOpen } = useDemo1Layout();
  const { currentUser } = useAuthContext();
  const logoUrl =
    currentUser && currentUser.agency?.logo
      ? currentUser.agency.logo
      : toAbsoluteUrl("/media/app/RJL.png");

  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };

  return (
    <div className="flex gap-1 lg:hidden items-center -ms-1">
      <Link to="/" className="shrink-0">
        <img src={logoUrl} className="max-h-[25px] w-full" alt="mini-logo" />
      </Link>

      <div className="flex items-center">
        <button
          type="button"
          className="btn btn-icon btn-light btn-clear btn-sm"
          onClick={handleSidebarOpen}
        >
          <KeenIcon icon="menu" />
        </button>
      </div>
    </div>
  );
};

export { HeaderLogo };

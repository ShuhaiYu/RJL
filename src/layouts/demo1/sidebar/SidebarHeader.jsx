import * as React from "react";
import { Link } from "react-router-dom";
import { useDemo1Layout } from "../";
import { toAbsoluteUrl } from "@/utils";
import { SidebarToggle } from "./";
import { useAuthContext } from '@/auth';

const SidebarHeader = React.forwardRef((props, ref) => {
  const { layout } = useDemo1Layout();
  const { currentUser } = useAuthContext();
  const logoUrl =
    currentUser &&
    currentUser.agency?.logo
      ? currentUser.agency.logo
      : toAbsoluteUrl("/media/app/RJL.png");

  const lightLogo = () => (
    <>
      <Link to="/" className="dark:hidden">
        <img src={logoUrl} className="default-logo min-h-[22px] max-h-[50px] max-w-[50px]" alt="logo" />
        <img src={logoUrl} className="small-logo min-h-[22px] max-h-[50px] max-w-[50px]" alt="logo" />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img src={logoUrl} className="default-logo min-h-[22px] max-h-[50px] max-w-[50px]" alt="logo" />
        <img src={logoUrl} className="small-logo min-h-[22px] max-h-[50px] max-w-[50px]" alt="logo" />
      </Link>
    </>
  );

  const darkLogo = () => (
    <Link to="/">
      <img src={logoUrl} className="default-logo min-h-[22px] max-w-[50px]" alt="logo" />
      <img src={logoUrl} className="small-logo min-h-[22px] max-w-[50px]" alt="logo" />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
    >
      {layout.options.sidebar.theme === "light" ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };

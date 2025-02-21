import { Navigate, Route, Routes } from "react-router";
import { DefaultPage, Demo1DarkSidebarPage } from "@/pages/dashboards";
import { ProfileCRMPage } from "@/pages/public-profile";
import {
  AccountCompanyProfilePage,
  AccountUserProfilePage,
} from "@/pages/account/home";
import { AgenciesList } from "@/pages/agency/list";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import CreateAgency from "../pages/agency/create/CreateAgency";
import AgencyDetail from "../pages/agency/detail/AgencyDetail";
import MyProperties from "../pages/property/my-properties/MyProperties";
import Tasks from "../pages/property/tasks/Tasks";
import PropertyDetailPage from "../pages/property/property-page/PeopertyDetailPage";
import TaskDetailPage from "../pages/property/task-page/TaskDetailPage";
import CreatePropertyPage from "../pages/property/create-property/CreatePropertyPage";
import CreateTaskPage from "../pages/property/create-task/CreateTaskPage";
import CreateUserPage from "../pages/user/create-user/CreateUserPage";
import Emails from "../pages/email/Emails";
import { ContactPage } from "../pages/contact/ContactPage";
import { CreateContactPage } from "../pages/contact/CreateContactPage";
import { AllUsersPage } from "../pages/user/AllUsersPage";
import { ModifyUserPermissionPage } from "../pages/user/user-permission/ModifyUserPermissionPage";

const AppRoutingSetup = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />
          <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />
          <Route
            path="/public-profile/profiles/crm"
            element={<ProfileCRMPage />}
          />
          <Route
            path="/public-profile/profiles/create"
            element={<CreateUserPage />}
          />
          <Route path="/users" element={<AllUsersPage />} />
          <Route path="/users/:id/permissions" element={<ModifyUserPermissionPage />} />

          <Route path="/agencies/my-agencies" element={<AgenciesList />} />
          <Route path="/agencies/create-agency" element={<CreateAgency />} />
          <Route path="/agencies/:id" element={<AgencyDetail />} />
          <Route path="/property">
            <Route path="my-properties" element={<MyProperties />} />
            <Route path="create" element={<CreatePropertyPage />} />
            <Route path=":id" element={<PropertyDetailPage />} />

            <Route path="tasks">
              <Route index element={<Tasks />} />
              <Route path="create" element={<CreateTaskPage />} />
              <Route path=":id" element={<TaskDetailPage />} />
            </Route>
          </Route>

          <Route
            path="/account/home/user-profile"
            element={<AccountUserProfilePage />}
          />
          <Route
            path="/account/home/company-profile"
            element={<AccountCompanyProfilePage />}
          />
          <Route path="/emails" element={<Emails />} />
          <Route path="/contacts" element={<ContactPage />} />
          <Route path="/contacts/create" element={<CreateContactPage />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};
export { AppRoutingSetup };

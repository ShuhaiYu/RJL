import { Navigate, Route, Routes } from "react-router";
import { Demo1DarkSidebarPage } from "@/pages/dashboards/demo1/dark-sidebar/Demo1DarkSidebarPage";
import { DefaultPage } from "../pages/dashboards/default/DefaultPage";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import CreateAgency from "../pages/agency/CreateAgency";
import AgencyDetail from "../pages/agency/AgencyDetail";
import MyProperties from "../pages/property/MyProperties";
import TaskDetailPage from "../pages/task/TaskDetailPage";
import CreatePropertyPage from "../pages/property/CreatePropertyPage";
import CreateTaskPage from "../pages/task/CreateTaskPage";
import CreateUserPage from "../pages/user/CreateUserPage";
import Emails from "../pages/email/Emails";
import ContactPage from "../pages/contact/ContactPage";
import CreateContactPage from "../pages/contact/CreateContactPage";
import AllUsersPage from "../pages/user/AllUsersPage";
import ModifyUserPermissionPage from "../pages/user/ModifyUserPermissionPage";
import EditUserPage from "../pages/user/EditUserPage";
import ProfileCRMPage from "../pages/public-profile/profiles/crm/ProfileCRMPage";
import AgenciesList from "../pages/agency/AgenciesList";
import Tasks from "../pages/task/Tasks";
import PropertyDetailPage from "../pages/property/PeopertyDetailPage";
import SystemSettingPage from "../pages/setting/SystemSettingPage.jsx";
import DataImportPage from "../pages/setting/DataImportPage.jsx";
import VeuDashboardPage from "../pages/veu/VeuDashboardPage";
import VeuIncompleteListPage from "../pages/veu/VeuIncompleteListPage";
import VeuIncompleteWaterHeaterPage from "../pages/veu/VeuIncompleteWaterHeaterPage";
import VeuIncompleteAirConditionerPage from "../pages/veu/VeuIncompleteAirConditionerPage";
import InspectionDashboardPage from "../pages/inspection/InspectionDashboardPage";
import InspectionSchedulesPage from "../pages/inspection/InspectionSchedulesPage";
import ScheduleDetailPage from "../pages/inspection/ScheduleDetailPage";
import BookingsListPage from "../pages/inspection/BookingsListPage";
import PublicBookingPage from "../pages/public/PublicBookingPage";

const AppRoutingSetup = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />
          <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />

          {/* VEU */}
          <Route path="/veu">
            <Route path="dashboard" element={<VeuDashboardPage />} />
            <Route path="incomplete" element={<VeuIncompleteListPage />} />
            <Route
              path="incomplete/water-heater"
              element={<VeuIncompleteWaterHeaterPage />}
            />
            <Route
              path="incomplete/air-conditioner"
              element={<VeuIncompleteAirConditionerPage />}
            />
          </Route>

          <Route
            path="/public-profile/profiles/crm"
            element={<ProfileCRMPage />}
          />
          <Route
            path="/public-profile/profiles/create"
            element={<CreateUserPage />}
          />
          <Route path="/users" element={<AllUsersPage />} />
          <Route
            path="/users/:id/permissions"
            element={<ModifyUserPermissionPage />}
          />
          <Route path="/users/:id/edit" element={<EditUserPage />} />

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

          <Route path="/emails" element={<Emails />} />

          <Route path="/contacts" element={<ContactPage />} />
          <Route path="/contacts/create" element={<CreateContactPage />} />

          <Route path="/setting/system" element={<SystemSettingPage />} />
          <Route path="/setting/import" element={<DataImportPage />} />

          {/* Inspection */}
          <Route path="/inspection">
            <Route index element={<InspectionDashboardPage />} />
            <Route path="schedules" element={<InspectionSchedulesPage />} />
            <Route path="schedules/:id" element={<ScheduleDetailPage />} />
            <Route path="bookings" element={<BookingsListPage />} />
          </Route>
        </Route>
      </Route>
      {/* Public Routes (no authentication required) */}
      <Route path="/book/:token" element={<PublicBookingPage />} />

      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};
export { AppRoutingSetup };

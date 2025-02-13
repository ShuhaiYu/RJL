import { Navigate, Route, Routes } from 'react-router';
import { DefaultPage, Demo1DarkSidebarPage } from '@/pages/dashboards';
import { ProfileCRMPage } from '@/pages/public-profile';
import { AccountCompanyProfilePage, AccountUserProfilePage } from '@/pages/account/home';
import { AgenciesList } from '@/pages/agency/list';
import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import CreateAgency from '../pages/agency/create/CreateAgency';
import AgencyDetail from '../pages/agency/detail/AgencyDetail';
import MyProperties from '../pages/property/my-properties/MyProperties';
import Tasks from '../pages/property/tasks/Tasks';
import PropertyDetailPage from '../pages/property/property-page/PeopertyDetailPage';
import TaskDetailPage from '../pages/property/task-page/TaskDetailPage';
import CreatePropertyPage from '../pages/property/create-property/CreatePropertyPage';
import CreateTaskPage from '../pages/property/create-task/CreateTaskPage';
const AppRoutingSetup = () => {
  return <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />
          <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />
          <Route path="/public-profile/profiles/crm" element={<ProfileCRMPage />} />
          <Route path="/agencies/my-agencies" element={<AgenciesList />} />
          <Route path="/agencies/create-agency" element={<CreateAgency />} />
          <Route path="/agencies/:id" element={<AgencyDetail/>} />
          <Route path="/property/my-properties" element={<MyProperties/>} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/property/create" element={<CreatePropertyPage />} />


          <Route path="/property/tasks" element={<Tasks />} />
          <Route path="/property/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/property/tasks/create" element={<CreateTaskPage />} />



          <Route path="/account/home/user-profile" element={<AccountUserProfilePage />} />
          <Route path="/account/home/company-profile" element={<AccountCompanyProfilePage />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>;
};
export { AppRoutingSetup };
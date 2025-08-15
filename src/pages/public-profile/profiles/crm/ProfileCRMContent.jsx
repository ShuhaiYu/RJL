// ProfileCRMContent.jsx
import { GeneralInfo } from './blocks/GeneralInfo';
import { Activity } from './blocks/Activity';
import StatsOverview from './blocks/StatsOverview';
import QuickActions from './blocks/QuickActions';
import RecentData from './blocks/RecentData';

const ProfileCRMContent = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 左侧列 */}
      <div className="lg:col-span-1 space-y-8">
        <GeneralInfo user={user} />
        <QuickActions />
      </div>
      
      {/* 右侧列 */}
      <div className="lg:col-span-2 space-y-8">
        <StatsOverview />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Activity />
          <RecentData />
        </div>
      </div>
    </div>
  );
};

export { ProfileCRMContent };

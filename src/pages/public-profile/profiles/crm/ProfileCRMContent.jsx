// ProfileCRMContent.jsx
import { GeneralInfo } from './blocks/GeneralInfo';
import { UserDataTable } from './blocks/UserDataTable';

const ProfileCRMContent = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
      {/* 左侧：用户基本信息和属性 */}
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <GeneralInfo user={user} />
        </div>
      </div>
      {/* 右侧：其他扩展信息（可根据实际需求扩展）
      <div className="col-span-2">
        <div className="bg-white p-5 shadow rounded">
        <UserDataTable 
          tasks={user?.tasks || []} 
          properties={user?.properties || []} 
        />
        </div>
      </div> */}
    </div>
  );
};

export { ProfileCRMContent };

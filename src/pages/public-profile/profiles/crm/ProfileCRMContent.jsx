// ProfileCRMContent.jsx
import { GeneralInfo } from './blocks/GeneralInfo';

const ProfileCRMContent = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
      {/* 左侧：用户基本信息和属性 */}
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <GeneralInfo user={user} />
        </div>
      </div>

    </div>
  );
};

export { ProfileCRMContent };

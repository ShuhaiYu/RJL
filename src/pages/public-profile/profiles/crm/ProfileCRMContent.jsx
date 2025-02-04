// ProfileCRMContent.jsx
import { GeneralInfo, Attributes } from './blocks';
// import { Contributors, Tags } from '../default';
// import { Activity, ApiCredentials, Deals, RecentInvoices } from './blocks';

const ProfileCRMContent = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <GeneralInfo user={user} />
          <Attributes />
          {/* 后续可以开启下面的组件 */}
          {/* <ApiCredentials /> */}
          {/* <Tags title="Skills" /> */}
        </div>
      </div>
      {/* 其他列内容，暂时注释掉 */}
      {/*
      <div className="col-span-2">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <Deals />
          <Activity />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
            <Contributors />
            <RecentInvoices />
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export { ProfileCRMContent };

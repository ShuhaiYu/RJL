import SendReminderButton from "./blocks/SendReminderButton";
import TodayTasks from "./blocks/TodayTasks";
import AgencyTasksDashboard  from "./blocks/AgencyTasksDashboard";
import { useAuthContext } from "@/auth";

const Demo1LightSidebarContent = () => {
  const { currentUser } = useAuthContext(); 

  const isAgency = !!currentUser.agency;
  return <div className="grid gap-5 lg:gap-7.5">

      <div className="w-full grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <SendReminderButton />
        </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-5 lg:gap-7.5 items-stretch">
        {isAgency ? (
          // 如果是agency，则显示"Due soon"组件
          <AgencyTasksDashboard  />
        ) : (
          // 否则显示旧的 TodayTasks
          <TodayTasks />
        )}
      </div>
    </div>;
};
export { Demo1LightSidebarContent };

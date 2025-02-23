import SendReminderButton from "./blocks/SendReminderButton";
import TodayTasks from "./blocks/TodayTasks";

const Demo1LightSidebarContent = () => {
  return <div className="grid gap-5 lg:gap-7.5">

      <div className="w-full grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <SendReminderButton />
        </div>

        {/* <div className="lg:col-span-2">
          <EarningsChart />
        </div> */}
      </div>

      <div className="grid lg:grid-cols-1 gap-5 lg:gap-7.5 items-stretch">
        <TodayTasks />
      </div>
    </div>;
};
export { Demo1LightSidebarContent };

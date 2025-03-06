import SendReminderButton from "./blocks/SendReminderButton";
import TasksDashboard from "./blocks/TasksDashboard";

const Demo1LightSidebarContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="w-full grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <SendReminderButton />
        </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-5 lg:gap-7.5 items-stretch">
        <TasksDashboard />
      </div>
    </div>
  );
};
export { Demo1LightSidebarContent };

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import AsyncPropertySelect from "../../components/custom/AsyncPropertySelect";
import AsyncAgencySelect from "../../components/custom/AsyncAgencySelect";

export default function CreateTaskPage() {
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  // 1) 获取 property 列表并存储
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState("none");

  // 新增字段
  const [taskType, setTaskType] = useState("GAS & ELECTRICITY");
  const [status, setStatus] = useState("INCOMPLETE");

  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const originalTask = location.state?.originalTask;
  const [emailId, setEmailId] = useState(null);

  const [selectedAgencyId, setSelectedAgencyId] = useState("");

  const isAgencyUser = currentUser?.agency_id ? true : false;

  useEffect(() => {
    if (isAgencyUser && currentUser.agency_id) {
      setSelectedAgencyId(String(currentUser.agency_id));
    }
  }, [isAgencyUser, currentUser]);

  useEffect(() => {
    if (originalTask) {
      // 填充表单字段
      setSelectedPropertyId(originalTask.property_id || "");
      setTaskName(originalTask.task_name || "");
      setTaskDescription(originalTask.task_description || "");

      // 处理日期格式
      if (originalTask.due_date) {
        const dueDate = new Date(originalTask.due_date);
        const formattedDueDate = dueDate.toISOString().slice(0, 16);
        setDueDate(formattedDueDate);
      }

      setRepeatFrequency(originalTask.repeat_frequency || "none");
      setTaskType(originalTask.type || "");
      setStatus(originalTask.status || "INCOMPLETE");

      // 收集邮件ID
      setEmailId(originalTask.email_id || null);
    }
  }, [originalTask]);

  // 3) 提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPropertyId || !taskName) {
      toast.error("Please select a property and enter a task name.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        property_id: selectedPropertyId,
        task_name: taskName,
        task_description: taskDescription,
        due_date: dueDate || null,
        repeat_frequency: repeatFrequency,
        // 新增
        type: taskType,
        status: status,
        email_id: emailId,
        agency_id: selectedAgencyId,
      };

      const response = await axios.post(`${baseApi}/tasks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Task created successfully!");
      // 跳转到新创建任务的详情页面（例如 /task/123）
      navigate(`/property/tasks/${response.data.data.id}`);
    } catch (error) {
      console.error("Create task error:", error);
      toast.error(error.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      {/* Back button */}
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate(-1)}
      >
        Back <i className="ki-filled ki-arrow-left"></i>
      </button>
      <div className="card-header py-5">
        <h3 className="card-title text-xl font-bold">Create New Job Order</h3>
      </div>
      <div className="card-body p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property 下拉选择 */}
          <div>
            <label className="block mb-2 font-medium">Select Property</label>
            <AsyncPropertySelect
              defaultPropertyId={originalTask?.property_id}
              onChange={(option) => setSelectedPropertyId(option.value)}
            />
          </div>

          {/* Task Name */}
          <div>
            <label className="block mb-2 font-medium">Job Order Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block mb-2 font-medium">
              Job Order Description
            </label>
            <textarea
              rows={3}
              className="textarea textarea-bordered w-full"
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block mb-2 font-medium">Job Order Type</label>
            <select
              className="select select-bordered w-full"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              <option value="GAS & ELECTRICITY">Gas & Electricity</option>
              <option value="SMOKE ALARM">Smoke Alarm</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block mb-2 font-medium">Due Date</label>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Repeat Frequency */}
          <div>
            <label className="block mb-2 font-medium">Repeat Frequency</label>
            <select
              className="select select-bordered w-full"
              value={repeatFrequency}
              onChange={(e) => setRepeatFrequency(e.target.value)}
            >
              <option value="none">None</option>
              <option value="1 month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
              <option value="3 years">3 Years</option>
            </select>
          </div>

          {/* 下拉选择 Agency (如果是 RJL 用户显示, 中介用户只显示自己的 agency) */}
          <div>
            <label className="block mb-2 font-medium">Job Order Agency</label>

            <AsyncAgencySelect
              onChange={(option) => setSelectedAgencyId(option)}
              placeholder="Select agency..."
              isDisabled={isAgencyUser}
              defaultValue={
                isAgencyUser
                  ? {
                      value: currentUser.agency_id,
                      label: currentUser.agency.agency_name,
                    }
                  : undefined
              }
            />
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

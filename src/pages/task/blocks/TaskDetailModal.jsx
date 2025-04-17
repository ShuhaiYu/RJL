// src/components/TaskDetailModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useAuthContext } from "@/auth";

export default function TaskDetailModal({ task, onClose }) {
  // 初始化各项状态
  const [taskName, setTaskName] = useState(task.task_name || "");
  const [taskDescription, setTaskDescription] = useState(
    task.task_description || ""
  );
  const [dueDate, setDueDate] = useState("");
  const [inspectionDate, setInspectionDate] = useState(
    task.inspection_date || ""
  );
  const [type, setType] = useState(task.type || "unknown");
  const [repeatFrequency, setRepeatFrequency] = useState(
    task.repeat_frequency || "none"
  );
  const [agencies, setAgencies] = useState([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState(
    task.agency_id || ""
  );

  // 新增状态：status 根据 inspection_date 判断初始值（如果任务中已有 status，则使用；否则 inspection_date 有值时为 PROCESSING，否则为 INCOMPLETE）
  const initialStatus = task.status
    ? task.status
    : task.inspection_date
      ? "PROCESSING"
      : "INCOMPLETE";
  const [status, setStatus] = useState(initialStatus);

  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const isAgencyUser = currentUser?.agency_id ? true : false;

  const userTimeZone = "Australia/Sydney"; // 可根据实际情况调整

  // 初始化 dueDate 和 inspectionDate 输入框格式
  useEffect(() => {
    if (task.due_date) {
      const serverUtcDate = new Date(task.due_date);
      const zonedDate = toZonedTime(serverUtcDate, userTimeZone);
      const displayString = format(zonedDate, "yyyy-MM-dd'T'HH:mm");
      setDueDate(displayString);
    } else {
      setDueDate("");
    }
    if (task.inspection_date) {
      const serverUtcDate = new Date(task.inspection_date);
      const zonedDate = toZonedTime(serverUtcDate, userTimeZone);
      const displayString = format(zonedDate, "yyyy-MM-dd'T'HH:mm");
      setInspectionDate(displayString);
    } else {
      setInspectionDate("");
    }
  }, [task.due_date, task.inspection_date, userTimeZone]);

  // 获取 agency 列表
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${baseApi}/agencies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAgencies(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch agencies:", err);
      });
  }, [token]);

  useEffect(() => {
    if (isAgencyUser && currentUser.agency_id) {
      setSelectedAgencyId(String(currentUser.agency_id));
    }
  }, [isAgencyUser, currentUser]);

  const handleSaveTask = () => {
    // 保存任务时将 status 也一并传递给后端
    axios
      .put(
        `${baseApi}/tasks/${task.id}`,
        {
          task_name: taskName,
          task_description: taskDescription,
          due_date: dueDate,
          inspection_date: inspectionDate,
          status: status,
          type: type,
          repeat_frequency: repeatFrequency,
          agency_id: selectedAgencyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        toast("Task updated successfully");
        onClose(); // 保存成功后关闭 Modal，父页面可刷新数据
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to update task");
      });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">Edit Job Order</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* 任务编辑表单 */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Job Order Name</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Job Order Description
          </label>
          <textarea
            rows={3}
            className="border w-full p-2 rounded"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Due Date</label>
          <input
            type="datetime-local"
            className="border w-full p-2 rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Inspection Date</label>
          <div className="flex items-center">
            <input
              type="datetime-local"
              className="border w-full p-2 rounded"
              value={inspectionDate}
              // 只有当 status 为 INCOMPLETE 或 PROCESSING 时允许修改
              disabled={!(status === "INCOMPLETE" || status === "PROCESSING")}
              onChange={(e) => {
                const value = e.target.value;
                setInspectionDate(value);
                // 如果有值，则状态为 PROCESSING，否则为 INCOMPLETE
                if (value) {
                  setStatus("PROCESSING");
                } else {
                  setStatus("INCOMPLETE");
                }
              }}
            />
            {/* 增加一个设置为空的按钮 */}
            {(status === "INCOMPLETE" || status === "PROCESSING") && (
              <button
                type="button"
                className="btn btn-sm btn-secondary ml-2"
                onClick={() => {
                  setInspectionDate("");
                  setStatus("INCOMPLETE");
                }}
              >
                Set Null
              </button>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Type</label>
          <select
            className="border w-full p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="GAS & ELECTRICITY">Gas & Electricity</option>
            <option value="SMOKE ALARM">Smoke Alarm</option>
            <option value="">-</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Repeat Frequency</label>
          <select
            className="border w-full p-2 rounded"
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
        <div className="mb-4">
          <label className="block mb-2 font-medium">Job Order Agency</label>
          <select
            className="select select-bordered w-full"
            value={selectedAgencyId}
            disabled={isAgencyUser}
            onChange={(e) => setSelectedAgencyId(e.target.value)}
          >
            <option value="">-- Choose Agency --</option>
            {agencies.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.agency_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSaveTask}
          >
            Save Job Order
          </button>
        </div>
      </div>
    </div>
  );
}

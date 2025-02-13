// src/components/TaskDetailModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useAuthContext } from "@/auth";

export default function TaskDetailModal({ task, onClose }) {
  // 直接使用从父组件传入的 task 数据，不再重新请求 API
  const [taskName, setTaskName] = useState(task.task_name || "");
  const [taskDescription, setTaskDescription] = useState(task.task_description || "");
  const [dueDate, setDueDate] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState(task.repeat_frequency || "none");

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  
  const userTimeZone = "Australia/Sydney"; // 可根据实际情况调整

  // 初始化 dueDate 输入框：如果 task.due_date 存在，则格式化成 "yyyy-MM-ddTHH:mm"
  useEffect(() => {
    if (task.due_date) {
      const serverUtcDate = new Date(task.due_date);
      const zonedDate = toZonedTime(serverUtcDate, userTimeZone);
      const displayString = format(zonedDate, "yyyy-MM-dd'T'HH:mm");
      setDueDate(displayString);
    } else {
      setDueDate("");
    }
  }, [task.due_date, userTimeZone]);

  const handleSaveTask = () => {
    // 此处直接使用 dueDate 字符串，无需转换
    axios
      .put(
        `${baseApi}/tasks/${task.id}`,
        {
          task_name: taskName,
          task_description: taskDescription,
          due_date: dueDate || null,
          repeat_frequency: repeatFrequency,
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
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* 任务编辑表单 */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Task Name</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Task Description</label>
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
          <label className="block mb-1 font-medium">Repeat Frequency</label>
          <select
            className="border w-full p-2 rounded"
            value={repeatFrequency}
            onChange={(e) => setRepeatFrequency(e.target.value)}
          >
            <option value="none">None</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSaveTask}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}

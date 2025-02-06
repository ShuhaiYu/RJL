// src/pages/Tasks.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import TaskDetailModal from "./blocks/TaskDetailModal"; // NEW

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null); // NEW
  const { auth } = useAuthContext();
  const token = auth?.accessToken;

  // 1. 把获取任务列表的逻辑抽成 fetchTasks 函数
  const fetchTasks = useCallback(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/agency/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch tasks');
        setLoading(false);
      });
  }, [token]);

  // 2. 在组件初次渲染时 (或token变化时) 调用 fetchTasks
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, fetchTasks]);

  // 3. 点击任务时，设置 selectedTaskId 打开弹窗
  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  // 4. 关闭弹窗时，清空 selectedTaskId，并手动再次刷新列表
  const closeTaskModal = () => {
    setSelectedTaskId(null);
    fetchTasks(); // 在对话框关闭后再次获取最新列表
  };

  // 渲染逻辑
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border p-4 rounded hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTaskClick(task.id)}
            >
              <div className="mb-2">
                <h2 className="text-xl font-semibold">{task.task_name}</h2>
                {task.due_date && (
                  <p className="text-gray-600">
                    Due: {new Date(task.due_date).toLocaleString()}
                  </p>
                )}
              </div>
              {task.task_description && (
                <p className="mt-2 text-gray-700">{task.task_description}</p>
              )}
              {/* 如果存在房产信息，则展示 */}
              {task.property_name && (
                <div className="mt-4 p-2 border-t border-gray-200">
                  <p className="text-gray-800 font-medium">Property:</p>
                  <p className="text-gray-600">{task.property_name}</p>
                  {task.property_address && (
                    <p className="text-gray-500 text-sm">
                      {task.property_address}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          token={token}
          onClose={closeTaskModal}
        />
      )}
    </div>
  );
}

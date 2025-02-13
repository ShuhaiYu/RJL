// src/pages/Tasks.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useNavigate } from "react-router-dom";

function TasksDataTable({ tasks, onTaskClick }) {
  return (
    <div className="grid">
      <div className="card card-grid min-w-full">
        <div className="card-header py-5 flex-wrap items-center justify-between">
          <h3 className="card-title text-xl font-bold">Tasks</h3>
          {/* 可在此处添加刷新、过滤等操作 */}
        </div>
        <div className="card-body">
          {/* 这里建议加上 data-datatable 属性（如果需要插件自动初始化） */}
          <div data-datatable="true" data-datatable-page-size="5" data-datatable-state-save="true" className="scrollable-x-auto">
            <table
              className="table table-auto table-border"
              data-datatable-table="true"
            >
              <thead>
                <tr>
                  <th className="w-[100px] text-center">
                    <span className="sort">
                      <span className="sort-label">ID</span>
                      <span className="sort-icon"></span>
                    </span>
                  </th>
                  <th className="min-w-[185px]">
                    <span className="sort">
                      <span className="sort-label">Task Name</span>
                      <span className="sort-icon"></span>
                    </span>
                  </th>
                  <th className="w-[185px]">
                    <span className="sort">
                      <span className="sort-label">Status</span>
                      <span className="sort-icon"></span>
                    </span>
                  </th>
                  <th className="w-[150px]">
                    <span className="sort">
                      <span className="sort-label">Due Date</span>
                      <span className="sort-icon"></span>
                    </span>
                  </th>
                  <th className="w-[60px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <td className="px-4 py-2 text-center">{task.id}</td>
                    <td className="px-4 py-2">{task.task_name}</td>
                    <td className="px-4 py-2">{task.status}</td>
                    <td className="px-4 py-2">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="btn btn-sm btn-icon btn-clear btn-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task.id);
                        }}
                      >
                        <i className="ki-outline ki-notepad-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer flex items-center justify-between text-gray-600 text-xs">
          <div className="flex items-center gap-2">
            Show
            <select className="select select-sm w-16">
              <option>5</option>
              <option>10</option>
              <option>20</option>
            </select>
            per page
          </div>
          <div className="pagination">
            {/* 分页控件 */}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const fetchTasks = () => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${baseApi}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch tasks");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleTaskClick = (taskId) => {
    // 跳转到 TaskDetailPage（例如：/task/:id）
    navigate(`/property/tasks/${taskId}`);
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tasks</h1>
      {tasks.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No tasks found.</p>
        </div>
      ) : (
        <TasksDataTable tasks={tasks} onTaskClick={handleTaskClick} />
      )}
    </div>
  );
}

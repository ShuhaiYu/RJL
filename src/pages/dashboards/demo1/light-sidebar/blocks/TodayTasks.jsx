import { useAuthContext } from "@/auth";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TasksDataTable from "../../../../task/blocks/TasksDataTable";

export default function TodayTasks() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const [tasks, setTasks] = useState([]);

  const navigate = useNavigate();

  const fetchTasks = () => {
    if (!token) return;
    axios
      .get(`${baseApi}/tasks/today`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTasks(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // 根据状态过滤任务
  const undoTasks = tasks.filter((task) => task.status === "INCOMPLETE");
  const doingTasks = tasks.filter((task) => task.status === "PROCESSING");
  const unknownTasks = tasks.filter((task) => task.status === "UNKNOWN");

  // 点击单个任务时跳转
  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", marginBottom: '20px'  }}>
        <h2 className="text-lg font-semibold text-gray-800">Unknown Tasks</h2>
        <TasksDataTable tasks={unknownTasks} onTaskClick={handleTaskClick} />
      </div>
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <h2 className="text-lg font-semibold text-gray-800">Incomplete Tasks</h2>
        <TasksDataTable tasks={undoTasks} onTaskClick={handleTaskClick} />
      </div>
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <h2 className="text-lg font-semibold text-gray-800">Processing Tasks</h2>
        <TasksDataTable tasks={doingTasks} onTaskClick={handleTaskClick} />
      </div>
    </div>
  );
}

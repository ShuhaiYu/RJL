import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useNavigate, useLocation } from "react-router-dom";
import TasksDataTable from "./blocks/TasksDataTable";
import { Box, CircularProgress } from "@mui/material";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  const location = useLocation();

  // 从 URL 中解析查询参数
  const queryParams = new URLSearchParams(location.search);
  const statusQuery = queryParams.get("status");
  const typeQuery = queryParams.get("type");

  // 从 state 中获取 agency_id（如果有）
  const agencyIdFromState = location.state?.agency_id;

  // 根据查询参数动态构造 h1 标题
  let h1Title = "Job Orders";
  if (statusQuery || typeQuery) {
    const parts = [];
    if (statusQuery) parts.push(`Status: ${statusQuery}`);
    if (typeQuery) parts.push(`Type: ${typeQuery}`);
    h1Title = `Tasks (${parts.join(", ")})`;
  }
  if (agencyIdFromState) {
    h1Title = h1Title + " for Agency";
  }

  const fetchTasks = () => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${baseApi}/tasks${location.search}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let data = response.data;
        // 如果传入 agency_id，则过滤任务数据
        if (agencyIdFromState) {
          data = data.filter((task) => task.agency_id === agencyIdFromState);
        }
        setTasks(data);
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
  }, [token, location.search, agencyIdFromState]);

  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{h1Title}</h1>

      {tasks.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No Job Order Found.</p>
        </div>
      ) : (
        <TasksDataTable tasks={tasks} onTaskClick={handleTaskClick} />
      )}
    </div>
  );
}

// src/pages/Dashboard/blocks/AgencyTasksDashboard.jsx
import { useEffect, useState } from "react";
import { useAuthContext } from "@/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TasksDataTable from "../../../../property/tasks/blocks/TasksDataTable";

export default function AgencyTasksDashboard() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  // 分别存储“Due Soon”与“Processing”列表
  const [dueSoonTasks, setDueSoonTasks] = useState([]);
  const [processingTasks, setProcessingTasks] = useState([]);

  const fetchAgencyTasks = async () => {
    if (!token) return;
    try {
      // 你可以用一个接口返回两类数据，也可以调两次不同接口
      // 这里示例用同一接口 /tasks/agency-lists
      // 返回格式: { dueSoon: [...], processing: [...] }
      const res = await axios.get(`${baseApi}/tasks/agency-lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDueSoonTasks(res.data.dueSoon || []);
      setProcessingTasks(res.data.processing || []);
    } catch (error) {
      console.error("Failed to load agency tasks:", error);
      toast.error("Failed to load agency tasks");
    }
  };

  useEffect(() => {
    fetchAgencyTasks();
  }, [token]);

  // 点击任务 => 跳转到任务详情
  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Due Soon
        </h2>
        <TasksDataTable tasks={dueSoonTasks} onTaskClick={handleTaskClick} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Processing Tasks
        </h2>
        <TasksDataTable tasks={processingTasks} onTaskClick={handleTaskClick} />
      </div>
    </div>
  );
}

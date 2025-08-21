import { useAuthContext } from "@/auth";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TasksDataTable from "../../../../task/blocks/TasksDataTable";
import { KeenIcon } from "@/components";
import { toast } from "sonner";

export default function TodayTasks() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchTasks = () => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${baseApi}/tasks/today`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch today's tasks");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Filter tasks by status
  const undoTasks = tasks.filter((task) => task.status === "INCOMPLETE");
  const doingTasks = tasks.filter((task) => task.status === "PROCESSING");
  const unknownTasks = tasks.filter((task) => task.status === "UNKNOWN");

  // Navigate when clicking on a single task
  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unknown Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <KeenIcon icon="question-circle" className="text-xl text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">Unknown Tasks</h2>
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {unknownTasks.length}
          </span>
        </div>
        {unknownTasks.length === 0 ? (
          <div className="text-center py-8">
            <KeenIcon icon="check-circle" className="text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">No unknown tasks</p>
          </div>
        ) : (
          <TasksDataTable tasks={unknownTasks} onTaskClick={handleTaskClick} />
        )}
      </div>

      {/* Incomplete Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <KeenIcon icon="time" className="text-xl text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-800">Incomplete Tasks</h2>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {undoTasks.length}
          </span>
        </div>
        {undoTasks.length === 0 ? (
          <div className="text-center py-8">
            <KeenIcon icon="check-circle" className="text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">No incomplete tasks</p>
          </div>
        ) : (
          <TasksDataTable tasks={undoTasks} onTaskClick={handleTaskClick} />
        )}
      </div>

      {/* Processing Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <KeenIcon icon="loading" className="text-xl text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Processing Tasks</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {doingTasks.length}
          </span>
        </div>
        {doingTasks.length === 0 ? (
          <div className="text-center py-8">
            <KeenIcon icon="check-circle" className="text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">No processing tasks</p>
          </div>
        ) : (
          <TasksDataTable tasks={doingTasks} onTaskClick={handleTaskClick} />
        )}
      </div>
    </div>
  );
}

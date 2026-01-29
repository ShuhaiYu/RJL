import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/auth";
import TasksDataTable from "./blocks/TasksDataTable";
import { Box, CircularProgress } from "@mui/material";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { toast } from "sonner";
import StatsCards from "@/components/common/StatsCards";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    filtered: 0
  });

  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  const location = useLocation();

  // 从 URL 中解析查询参数
  const queryParams = new URLSearchParams(location.search);
  const statusQuery = queryParams.get("status");
  const typeQuery = queryParams.get("type");

  // 从 state 中获取 agency_id（如果有）
  const agencyIdFromState = location.state?.agency_id;
  const agencyNameFromQuery = location.state?.agency_name;

  // 根据查询参数动态构造标题
  let pageTitle = "Job Orders";
  let pageSubtitle = "Manage and track all job orders";
  
  // Type labels for user-friendly display
  const typeLabels = {
    "SMOKE_ALARM": "Smoke Alarm",
    "GAS_&_ELECTRICITY": "Gas & Electricity",
  };

  if (statusQuery || typeQuery) {
    const parts = [];
    if (statusQuery) {
      const statusLabel = statusQuery.replace("_", " ");
      parts.push(statusLabel);
      pageTitle = `${statusLabel} Job Orders`;
    }
    if (typeQuery) {
      const typeLabel = typeLabels[typeQuery] || typeQuery.replace(/_/g, " ");
      parts.push(typeLabel);
      pageTitle = typeQuery ? `${typeLabel} Tasks` : pageTitle;
    }
    pageSubtitle = `Filtered job orders: ${parts.join(", ")}`;
  }
  
  if (agencyIdFromState) {
    pageTitle = `${pageTitle} - ${agencyNameFromQuery}`;
    pageSubtitle = `Job orders for ${agencyNameFromQuery}`;
  }

  const fetchTasks = () => {
    if (!token) return;
    setLoading(true);

    // Build URL with limit parameter
    const params = new URLSearchParams(location.search);
    params.set('limit', '1000');
    const queryString = params.toString();

    axios
      .get(`${baseApi}/tasks?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let data = response.data || [];
        // 如果传入 agency_id，则过滤任务数据
        if (agencyIdFromState) {
          data = data.filter((task) => task.agency_id === agencyIdFromState);
        }
        setTasks(data);
        
        // 计算统计信息
        const total = data.length;
        const pending = data.filter(task => 
          ['UNKNOWN', 'INCOMPLETE', 'PROCESSING'].includes(task.status)
        ).length;
        
        setTaskStats({
          total,
          pending,
          filtered: total
        });
        
        setLoading(false);
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message || "Failed to fetch tasks";
        setError(errorMessage);
        toast.error(errorMessage);
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

  const handleCreate = () => {
    // Pass the type directly as-is (e.g., SMOKE_ALARM, GAS_&_ELECTRICITY)
    const state = typeQuery ? { originalTask: { type: typeQuery } } : {};
    navigate("/property/tasks/create", { state });
  };

  // 判断当前用户是否有创建任务的权限
  const canCreateTask = currentUser?.permissions?.task?.includes("create");

  // 获取状态颜色
  const getStatusColor = (status) => {
    const colors = {
      'UNKNOWN': 'bg-amber-100 text-amber-700',
      'INCOMPLETE': 'bg-orange-100 text-orange-700',
      'PROCESSING': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'DUE_SOON': 'bg-red-100 text-red-700',
      'EXPIRED': 'bg-red-200 text-red-800',
      'HISTORY': 'bg-purple-100 text-purple-700',
      'CANCEL': 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
            <KeenIcon icon="scroll" className="text-2xl text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">{pageSubtitle}</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mb-6">
        <StatsCards
          title="Job Order Statistics"
          loading={loading}
          cards={[
          {
            key: 'total',
            title: 'Total Job Orders',
            value: taskStats.total,
            icon: 'scroll',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            route: null
          },
          {
            key: 'pending',
            title: 'Pending Tasks',
            value: taskStats.pending,
            icon: 'time',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            route: null
          },
          {
            key: 'filtered',
            title: 'Filtered Results',
            value: taskStats.filtered,
            icon: 'filter',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            route: null
          }
        ]}
        />
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Job Orders List</h2>
            {(statusQuery || typeQuery) && (
              <div className="flex items-center gap-2">
                {statusQuery && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusQuery)}`}>
                    {statusQuery.replace('_', ' ')}
                  </span>
                )}
                {typeQuery && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {typeLabels[typeQuery] || typeQuery.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            )}
          </div>
          {canCreateTask && (
            <Button 
              variant="create" 
              onClick={handleCreate}
              className="flex items-center gap-2"
            >
              <KeenIcon icon="plus" className="text-sm" />
              Create Job Order
            </Button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mx-auto mb-4">
              <KeenIcon icon="information" className="text-2xl text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Job Orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchTasks} variant="outline">
              <KeenIcon icon="arrows-circle" className="text-sm mr-2" />
              Try Again
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4">
              <KeenIcon icon="file-sheet" className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {statusQuery || typeQuery 
                ? "No job orders match your current filters." 
                : "There are no job orders to display."}
            </p>
            {canCreateTask && (
              <Button onClick={handleCreate} variant="create">
                <KeenIcon icon="plus" className="text-sm mr-2" />
                Create First Job Order
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6">
            <TasksDataTable 
              tasks={tasks} 
              onTaskClick={handleTaskClick}
              onStatusUpdated={fetchTasks}
            />
          </div>
        )}
      </div>
    </div>
  );
}

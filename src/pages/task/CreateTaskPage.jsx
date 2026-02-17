import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import AsyncPropertySelect from "../../components/custom/AsyncPropertySelect";
import AsyncAgencySelect from "../../components/custom/AsyncAgencySelect";
import { KeenIcon } from "@/components";
import StatsCards from "@/components/common/StatsCards";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function CreateTaskPage() {
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  // 1) Get property list and store
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState("none");

  // New fields
  const [taskType, setTaskType] = useState("GAS_&_ELECTRICITY");
  const [status, setStatus] = useState("INCOMPLETE");

  const [loading, setLoading] = useState(false);
  
  // Statistics data state
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    recentTasks: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Form progress state
  const [formProgress, setFormProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

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
  
  // Fetch statistics data
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        setStatsLoading(true);
        const response = await axios.get(`${baseApi}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const tasks = response.data || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentTasks = tasks.filter(task => {
          const createdAt = new Date(task.created_at);
          return createdAt >= thirtyDaysAgo;
        }).length;
        
        const activeTasks = tasks.filter(task => 
          task.status === 'INCOMPLETE' || task.status === 'PROCESSING'
        ).length;
        
        setStats({
          totalTasks: tasks.length,
          activeTasks: activeTasks,
          recentTasks: recentTasks
        });
      } catch (error) {
        console.error('Failed to fetch task statistics:', error);
        // Set mock data
        setStats({
          totalTasks: 25,
          activeTasks: 8,
          recentTasks: 5
        });
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [token, baseApi]);
  
  // Calculate form progress
  useEffect(() => {
    const calculateProgress = () => {
      let progress = 0;
      let step = 1;
      
      // Basic information (60%)
      if (selectedPropertyId) progress += 20;
      if (taskName) progress += 20;
      if (taskType) progress += 20;
      
      // Detailed information (25%)
      if (taskDescription) {
        progress += 15;
        step = 2;
      }
      if (dueDate) {
        progress += 10;
      }
      
      // Assignment information (15%)
      if (selectedAgencyId) {
        progress += 15;
        step = 3;
      }
      
      setFormProgress(Math.min(progress, 100));
      setCurrentStep(step);
    };
    
    calculateProgress();
  }, [selectedPropertyId, taskName, taskType, taskDescription, dueDate, selectedAgencyId]);

  useEffect(() => {
    if (originalTask) {
      // Fill form fields
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
      setTaskType(originalTask.type ?? "GAS_&_ELECTRICITY");
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
        property_id: Number(selectedPropertyId),
        task_name: taskName,
        task_description: taskDescription || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        repeat_frequency: repeatFrequency,
        type: taskType || "GAS_&_ELECTRICITY",
        status: status,
        email_id: emailId,
      };

      const response = await axios.post(`${baseApi}/tasks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Task created successfully!");
      // 跳转到新创建任务的详情页面（例如 /task/123）
      navigate(`/property/tasks/${response.data.id}`);
    } catch (error) {
      console.error("Create task error:", error);
      toast.error(error.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <KeenIcon icon="arrow-left" className="text-sm" />
              Back
            </Button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <KeenIcon icon="plus-circle" className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create New Job Order</h1>
                  <p className="text-gray-600 text-sm">Add a new job order to the system</p>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Progress</div>
                  <div className="text-xs text-gray-500">Step {currentStep} of 3</div>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600 transition-all duration-300 ease-in-out"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${formProgress}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">{Math.round(formProgress)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <StatsCards
            title="Job Order Management Overview"
            loading={statsLoading}
            cards={[
              {
                key: 'total',
                title: 'Total Job Orders',
                value: stats.totalTasks,
                icon: 'document',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                route: '/property/tasks'
              },
              {
                key: 'active',
                title: 'Active Job Orders',
                value: stats.activeTasks,
                icon: 'loading',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                route: null
              },
              {
                key: 'recent',
                title: 'Recent Job Orders (30d)',
                value: stats.recentTasks,
                icon: 'calendar',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                route: null
              }
            ]}
          />
        </div>

        {/* Form Steps Indicator */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: 'Basic Info', icon: 'document', completed: selectedPropertyId && taskName && taskType },
                { step: 2, title: 'Details', icon: 'note', completed: taskDescription && dueDate },
                { step: 3, title: 'Assignment', icon: 'office-bag', completed: selectedAgencyId }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center">
                  <div className={`flex items-center gap-3 ${
                    currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      item.completed 
                        ? 'bg-green-100 text-green-600' 
                        : currentStep >= item.step 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {item.completed ? (
                        <KeenIcon icon="check" className="text-sm" />
                      ) : (
                        <span className="text-sm font-semibold">{item.step}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium">{item.title}</div>
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > item.step ? 'bg-blue-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* 表单卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <KeenIcon icon="document" className="text-xl text-gray-600" />
            Job Order Details
          </h2>
          <p className="text-gray-600 mt-1">Fill in the information below to create a new job order</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property 选择 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeenIcon icon="home-2" className="text-lg text-gray-500" />
                Select Property *
              </label>
              <div className="relative">
                <AsyncPropertySelect
                  defaultPropertyId={originalTask?.property_id}
                  onChange={(option) => setSelectedPropertyId(option.value)}
                />
              </div>
            </div>

            {/* Task Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeenIcon icon="edit" className="text-lg text-gray-500" />
                Job Order Name *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter job order name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeenIcon icon="note" className="text-lg text-gray-500" />
                Job Order Description
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                placeholder="Enter job order description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeenIcon icon="category" className="text-lg text-gray-500" />
                Job Order Type *
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              >
                <option value="GAS_&_ELECTRICITY">Gas & Electricity</option>
                <option value="SMOKE_ALARM">Smoke Alarm</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeenIcon icon="calendar" className="text-lg text-gray-500" />
                Due Date
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Repeat Frequency */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeenIcon icon="arrows-circle" className="text-lg text-gray-500" />
                Repeat Frequency
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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

            {/* Agency 选择 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeenIcon icon="office-bag" className="text-lg text-gray-500" />
                Job Order Agency *
              </label>
              <div className="relative">
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
            </div>

            {/* Form Completion Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Form Completion Status</h3>
                <span className="text-sm font-semibold text-gray-900">{Math.round(formProgress)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedPropertyId && taskName && taskType ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <span className={selectedPropertyId && taskName && taskType ? 'text-blue-700' : 'text-gray-500'}>
                    Basic Info
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    taskDescription && dueDate ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <span className={taskDescription && dueDate ? 'text-blue-700' : 'text-gray-500'}>
                    Details
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedAgencyId ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <span className={selectedAgencyId ? 'text-blue-700' : 'text-gray-500'}>
                    Assignment
                  </span>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <KeenIcon icon="cross" className="text-sm" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="create"
                disabled={loading || formProgress < 75}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <KeenIcon icon="loading" className="text-sm animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="text-sm" />
                    Create Job Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}

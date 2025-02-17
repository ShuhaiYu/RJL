import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { Button } from '@/components/ui/button'
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export default function CreateTaskPage() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  // 1) 获取 property 列表并存储
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeatFrequency, setRepeatFrequency] = useState('none');

  // 新增字段
  const [taskType, setTaskType] = useState('');
  const [status, setStatus] = useState('unknown');

  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const originalTask = location.state?.originalTask;
  const [emailIds, setEmailIds] = useState([]);

  // 2) 加载 property 列表
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${baseApi}/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProperties(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load properties:', err);
      });
  }, [token, baseApi]);

  useEffect(() => {
    if (originalTask) {
      // 填充表单字段
      setSelectedPropertyId(originalTask.property_id || '');
      setTaskName(originalTask.task_name || '');
      setTaskDescription(originalTask.task_description || '');
      
      // 处理日期格式
      if (originalTask.due_date) {
        const dueDate = new Date(originalTask.due_date);
        const formattedDueDate = dueDate.toISOString().slice(0, 16);
        setDueDate(formattedDueDate);
      }
      
      setRepeatFrequency(originalTask.repeat_frequency || 'none');
      setTaskType(originalTask.type || '');
      setStatus(originalTask.status || 'unknown');
      
      // 收集邮件ID
      const emails = originalTask.emails || [];
      setEmailIds(emails.map(email => email.id));
    }
  }, [originalTask]);

  // 3) 提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPropertyId || !taskName) {
      toast.error('Please select a property and enter a task name.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        property_id: selectedPropertyId,
        task_name: taskName,
        task_description: taskDescription,
        due_date: dueDate || null,
        repeat_frequency: repeatFrequency,
        // 新增
        type: taskType,
        status: status,
        email_ids: emailIds,
      };

      const response = await axios.post(
        `${baseApi}/tasks/create`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Task created successfully!');
      // 跳转到新创建任务的详情页面（例如 /task/123）
      navigate(`/task/${response.data.data.id}`);
    } catch (error) {
      console.error('Create task error:', error);
      toast.error(error.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
        <div className="card-header py-5">
          <h3 className="card-title text-xl font-bold">Create New Task</h3>
        </div>
        <div className="card-body p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Property 下拉选择 */}
            <div>
              <label className="block mb-2 font-medium">Select Property</label>
              <select
                className="select select-bordered w-full"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
              >
                <option value="">-- Please choose --</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Name */}
            <div>
              <label className="block mb-2 font-medium">Task Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block mb-2 font-medium">Task Description</label>
              <textarea
                rows={3}
                className="textarea textarea-bordered w-full"
                placeholder="Enter task description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block mb-2 font-medium">Task Type</label>
              <select
                className="select select-bordered w-full"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 font-medium">Status</label>
              <select
                className="select select-bordered w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="unknown">unknown</option>
                <option value="undo">undo</option>
                <option value="doing">doing</option>
                <option value="done">done</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block mb-2 font-medium">Due Date</label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Repeat Frequency */}
            <div>
              <label className="block mb-2 font-medium">Repeat Frequency</label>
              <select
                className="select select-bordered w-full"
                value={repeatFrequency}
                onChange={(e) => setRepeatFrequency(e.target.value)}
              >
                <option value="none">None</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
    </div>
  );
}

// src/pages/CreateTaskPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { toast } from 'sonner';

export default function CreateTaskPage() {
  const [propertyId, setPropertyId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeatFrequency, setRepeatFrequency] = useState('none');
  const [loading, setLoading] = useState(false);
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyId || !taskName) {
      toast.error('Please fill in all required fields (Property ID and Task Name).');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        property_id: propertyId,
        task_name: taskName,
        task_description: taskDescription,
        due_date: dueDate || null,
        repeat_frequency: repeatFrequency,
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
      <div className="card card-grid min-w-full">
        <div className="card-header py-5">
          <h3 className="card-title text-xl font-bold">Create New Task</h3>
        </div>
        <div className="card-body p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Property ID</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter associated property ID"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
              />
            </div>
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
            <div>
              <label className="block mb-2 font-medium">Due Date</label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
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
            <div>
              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

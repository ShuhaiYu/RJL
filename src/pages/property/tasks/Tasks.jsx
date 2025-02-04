import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/auth';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuthContext();
  const token = auth?.accessToken;

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/agency/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
              className="border p-4 rounded hover:shadow-md transition-shadow"
            >
              <Link to={`/admin/tasks/${task.id}`} className="block">
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useAuthContext } from '@/auth';
import axios from 'axios';
import { useState, useEffect } from 'react';
import TasksDataTable from '../../../../property/tasks/blocks/TasksDataTable';

export default function TodayTasks() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const [tasks, setTasks] = useState([]);

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
  const undoTasks = tasks.filter((task) => task.status === 'undo');
  const doingTasks = tasks.filter((task) => task.status === 'doing');

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <h2 className='text-lg font-semibold text-gray-800'>Undo Tasks</h2>
        <TasksDataTable tasks={undoTasks} />
      </div>
      <div style={{ width: '100%' }}>
        <h2 className='text-lg font-semibold text-gray-800'>Doing Tasks</h2>
        <TasksDataTable tasks={doingTasks} />
      </div>
    </div>
  );
}

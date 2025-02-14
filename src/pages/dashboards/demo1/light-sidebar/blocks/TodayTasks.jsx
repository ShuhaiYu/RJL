import { useAuthContext } from '@/auth';
import axios from 'axios'
import { useState, useEffect } from 'react'
import TasksDataTable from '../../../../property/tasks/blocks/TasksDataTable';

export default function TodayTasks() {
    const { auth, baseApi } = useAuthContext();
    const token = auth?.accessToken;
    const [tasks, setTasks] = useState([])

    const fetchTasks = () => {
        if (!token) return;
        axios.get(`${baseApi}/tasks/today`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setTasks(response.data)
            })
            .catch((err) => {
                console.error(err)
            })
    }

    useEffect(() => {
        fetchTasks()
    }, [token])


  return (
    <div>
        <TasksDataTable tasks={tasks} />
    </div>
  )
}

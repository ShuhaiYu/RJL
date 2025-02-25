// src/pages/property/tasks/Tasks.jsx

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthContext } from '@/auth'
import { useNavigate } from 'react-router-dom'
import TasksDataTable from './blocks/TasksDataTable'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { auth, baseApi } = useAuthContext()
  const token = auth?.accessToken
  const navigate = useNavigate()

  // 请求后端获取 tasks
  const fetchTasks = () => {
    if (!token) return
    setLoading(true)
    axios
      .get(`${baseApi}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTasks(response.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch tasks')
        setLoading(false)
      })
  }

  useEffect(() => {
    if (token) {
      fetchTasks()
    }
  }, [token])

  // 点击单个任务时跳转
  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`)
  }

  if (loading) {
    return <div>Loading tasks...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tasks</h1>

      {/* 数据表格 */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No tasks found.</p>
        </div>
      ) : (
        <TasksDataTable tasks={tasks} onTaskClick={handleTaskClick}/>
      )}
    </div>
  )
}

// src/pages/task/Tasks.jsx

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthContext } from '@/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import TasksDataTable from './blocks/TasksDataTable'
import { Box, CircularProgress } from "@mui/material";

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { auth, baseApi } = useAuthContext()
  const token = auth?.accessToken
  const navigate = useNavigate()
  const location = useLocation()

  // 从 URL 中解析查询参数
  const queryParams = new URLSearchParams(location.search)
  const statusQuery = queryParams.get('status')
  const typeQuery = queryParams.get('type')

  // 根据查询参数动态构造 h1 标题
  let h1Title = 'Job Orders'
  if (statusQuery || typeQuery) {
    const parts = []
    if (statusQuery) parts.push(`Status: ${statusQuery}`)
    if (typeQuery) parts.push(`Type: ${typeQuery}`)
    h1Title = `Tasks (${parts.join(', ')})`
  }

  // 请求后端获取 tasks，自动附加 URL 中的查询参数
  const fetchTasks = () => {
    if (!token) return
    setLoading(true)
    axios
      .get(`${baseApi}/tasks${location.search}`, {
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

  // 当 token 或 URL 查询参数变化时重新获取任务数据
  useEffect(() => {
    if (token) {
      fetchTasks()
    }
  }, [token, location.search])

  // 点击单个任务时跳转
  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`)
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{h1Title}</h1>

      {/* 数据表格 */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No Job Order Found.</p>
        </div>
      ) : (
        <TasksDataTable tasks={tasks} onTaskClick={handleTaskClick}/>
      )}
    </div>
  )
}

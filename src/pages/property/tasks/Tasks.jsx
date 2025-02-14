// src/pages/property/tasks/Tasks.jsx

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthContext } from '@/auth'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import TasksDataTable from './blocks/TasksDataTable'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])

  const { auth, baseApi } = useAuthContext()
  const token = auth?.accessToken
  const navigate = useNavigate()

  // 假设你要筛选的状态
  const statusOptions = [
    { value: 'unknown', label: 'Unknown' },
    { value: 'undo', label: 'Undo' },
    { value: 'doing', label: 'Doing' },
    { value: 'done', label: 'Done' },
  ]

  // 假设你要筛选的类型
  const typesOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
  ]

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

  // 根据选中的 status / type 来过滤 tasks
  useEffect(() => {
    let filtered = [...tasks]

    if (selectedStatuses.length > 0) {
      const selectedValues = selectedStatuses.map((s) => s.value)
      filtered = filtered.filter((task) => selectedValues.includes(task.status))
    }

    if (selectedTypes.length > 0) {
      const selectedValues = selectedTypes.map((t) => t.value)
      filtered = filtered.filter((task) => selectedValues.includes(task.type))
    }

    setFilteredTasks(filtered)
  }, [tasks, selectedStatuses, selectedTypes])

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

  // 当某行任务状态更新成功后
  const handleStatusUpdated = (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => {
      if(t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tasks</h1>

      {/* 筛选：状态 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Filter by status</h2>
        <Select
          isMulti
          options={statusOptions}
          value={selectedStatuses}
          onChange={(selected) => setSelectedStatuses(selected)}
          placeholder="Filter by status..."
        />
      </div>

      {/* 筛选：类型 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Filter by types</h2>
        <Select
          isMulti
          options={typesOptions}
          value={selectedTypes}
          onChange={(selected) => setSelectedTypes(selected)}
          placeholder="Filter by types..."
        />
      </div>

      {/* 数据表格 */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No tasks found.</p>
        </div>
      ) : (
        <TasksDataTable tasks={filteredTasks} onTaskClick={handleTaskClick} onStatusUpdated={handleStatusUpdated}/>
      )}
    </div>
  )
}

// src/pages/property/blocks/CreateTaskModal.jsx
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { useAuthContext } from '@/auth'

export default function CreateTaskModal({
  propertyId,  // 父组件传入的 propertyId
  onClose,     // 关闭弹窗的回调
  onCreated,  // 用来通知父组件“已成功创建任务”

}) {
  const { auth, baseApi } = useAuthContext()
  const token = auth?.accessToken

  // 表单状态
  const [taskName, setTaskName] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [repeatFrequency, setRepeatFrequency] = useState('none')
  const [loading, setLoading] = useState(false)

  // 关闭弹窗
  const closeThisModal = () => {
    if (onClose) onClose()
  }

  // 提交创建任务
  const handleCreateTask = async () => {
    // 简单校验
    if (!taskName) {
      toast.error('Task name is required!')
      return
    }

    setLoading(true)
    try {
      const payload = {
        property_id: propertyId,
        task_name: taskName,
        task_description: taskDesc,
        due_date: taskDue ? new Date(taskDue).toISOString() : null,
        repeat_frequency: repeatFrequency,
      }

      await axios.post(`${baseApi}/tasks/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success('Task created successfully!')
      if (onCreated) onCreated() // 通知父组件“已成功
      closeThisModal() // 关闭弹窗
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  // 如果没传 propertyId，就不渲染
  if (!propertyId) return null

  return (
    // 外层背景遮罩
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onClick={closeThisModal}
    >
      {/* 弹窗主体 */}
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()} // 阻止冒泡，避免点击弹窗本身关闭
      >
        {/* 标题 & 关闭按钮 */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">Create Task</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={closeThisModal}
          >
            ✕
          </button>
        </div>

        {/* 表单内容 */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Task Name</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            placeholder="Enter task name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Task Description</label>
          <textarea
            className="border w-full p-2 rounded"
            rows="3"
            placeholder="Enter task description"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Due Date</label>
          <input
            type="datetime-local"
            className="border w-full p-2 rounded"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Repeat Frequency</label>
          <select
            className="border w-full p-2 rounded"
            value={repeatFrequency}
            onChange={(e) => setRepeatFrequency(e.target.value)}
          >
            <option value="none">None</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
            onClick={closeThisModal}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleCreateTask}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import axios from 'axios'
import { useAuthContext } from '@/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function CreateUserPage() {
  const { auth, currentUser } = useAuthContext()
  const token = auth?.accessToken

  // 当前登录用户角色 + agency_id
  const currentUserRole = currentUser?.role
  const currentUserAgencyId = currentUser?.agency_id

  // 根据当前用户角色，决定能创建什么角色
  // superuser/admin -> 'agency-admin'
  // agency-admin -> 'agency-user'
  // agency-user -> 无法创建（''）
  let createableRole = ''
  if (currentUserRole === 'superuser' || currentUserRole === 'admin') {
    createableRole = 'agency-admin'
  } else if (currentUserRole === 'agency-admin') {
    createableRole = 'agency-user'
  } else {
    createableRole = ''
  }

  // 表单状态
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '', // 如果你要用户输入 name
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 如果当前用户是 agency-user，无法创建任何用户 -> 直接提示或禁用
  const canCreate = !!createableRole

  // 处理表单输入
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1) 判断是否能创建
    if (!canCreate) {
      setError('You do not have permission to create new users.')
      setLoading(false)
      return
    }

    // 2) 密码 & 确认密码一致性
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    // 3) 确认框
    const confirmMsg = `Are you sure to create a new user with role: ${createableRole}?`
    const isConfirmed = window.confirm(confirmMsg)
    if (!isConfirmed) {
      setLoading(false)
      return
    }

    // 4) 组装请求数据
    const payload = {
      email: form.email,
      password: form.password,
      name: form.name, // 若后端没这个字段也可去掉
      role: createableRole,
      agency_id: currentUserAgencyId || null, // 如果有 agency_id 就传，没有就传 null
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('User created:', response.data)

      toast.success('User created successfully!')
      // 清空表单
      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      })
    } catch (err) {
      console.error('Failed to create user:', err)
      setError(err.response?.data?.message || 'Failed to create user')
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create User</h1>
      
      {/* 如果没有权限canCreate，就提示不可创建 */}
      {!canCreate && (
        <p className="text-red-500 mb-4">
          You do not have permission to create new users.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (Optional)
          </label>
          <Input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="User's Name"
            disabled={!canCreate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            disabled={!canCreate}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            disabled={!canCreate}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <Input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            disabled={!canCreate}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading || !canCreate}>
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    </div>
  )
}

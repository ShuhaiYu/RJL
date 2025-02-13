import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthContext } from '@/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function CreateUserPage() {
  const { auth, currentUser, baseApi } = useAuthContext()
  const token = auth?.accessToken

  // 当前用户角色 + agency_id
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

  // 如果当前用户是 agency-user，无法创建任何用户 -> 直接提示或禁用
  const canCreate = !!createableRole

  // ---------- 额外新增：获取所有 Agency 列表（仅在 superuser/admin 时用） ----------
  const [agencies, setAgencies] = useState([])
  // 选中的 Agency ID（只有 superuser/admin 能选）
  const [selectedAgencyId, setSelectedAgencyId] = useState(null)

  useEffect(() => {
    // 只有在 superuser / admin 时才去加载 agencies
    if (currentUserRole === 'superuser' || currentUserRole === 'admin') {
      axios
        .get(`${baseApi}/agencies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setAgencies(res.data || [])
        })
        .catch((err) => {
          console.error('Failed to load agencies', err)
        })
    }
  }, [currentUserRole, token])

  // ---------------------------------------------------------------------

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 处理表单输入
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // 处理提交
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

    // 4) 准备 agencyId: 如果 superuser/admin，用 selectedAgencyId；否则用 currentUserAgencyId
    let finalAgencyId = null
    if (currentUserRole === 'superuser' || currentUserRole === 'admin') {
      // 选择器里必须选一个
      if (!selectedAgencyId) {
        setError('Please select an Agency.')
        setLoading(false)
        return
      }
      finalAgencyId = selectedAgencyId
    } else if (currentUserRole === 'agency-admin') {
      finalAgencyId = currentUserAgencyId || null
    }

    // 5) 组装请求数据
    const payload = {
      email: form.email,
      password: form.password,
      name: form.name,
      role: createableRole,
      agency_id: finalAgencyId,
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('User created:', response.data)
      toast.success('User created successfully!')

      // 清空表单
      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      })
      // 重置选中agency
      if (currentUserRole === 'superuser' || currentUserRole === 'admin') {
        setSelectedAgencyId(null)
      }
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
        {/* 如果是 superuser/admin，就显示一个 agency 下拉 */}
        {(currentUserRole === 'superuser' || currentUserRole === 'admin') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Agency
            </label>
            <select
              className="form-select block w-full border border-gray-300 rounded-md"
              value={selectedAgencyId || ''}
              onChange={(e) => setSelectedAgencyId(e.target.value)}
              disabled={!canCreate}
            >
              <option value="">-- Choose an agency --</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.agency_name || `Agency #${agency.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

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

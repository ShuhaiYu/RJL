import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";
import { KeenIcon } from "@/components/keenicons";
import StatsCards from "@/components/common/StatsCards";

export default function AllUsersPage() {
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [userStats, setUserStats] = useState({
    total: 0,
    byRole: {}
  });

  const canUpdateUser = currentUser?.permissions?.user?.includes("update");
  // 从 state 中获取 agency_id（如果有）
  const agencyIdFromState = location.state?.agency_id;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = response.data || [];
      // 如果传入了 agency_id，则只显示该机构下的用户
      if (agencyIdFromState) {
        data = data.filter((user) => user.agency_id === agencyIdFromState);
      }
      setUsers(data);
      setFilteredCount(data.length);
      
      // 计算用户统计信息
      const stats = {
        total: data.length,
        byRole: data.reduce((acc, user) => {
          const role = user.role || 'Unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {})
      };
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, agencyIdFromState]);

  const ColumnInputFilter = ({ column }) => (
    <Input
      placeholder="Filter..."
      value={column.getFilterValue() ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="h-9 w-full max-w-40"
    />
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': {
        color: 'bg-purple-100 text-purple-800',
        icon: 'crown'
      },
      'manager': {
        color: 'bg-blue-100 text-blue-800',
        icon: 'people'
      },
      'agent': {
        color: 'bg-green-100 text-green-800',
        icon: 'user-tick'
      },
      'user': {
        color: 'bg-gray-100 text-gray-800',
        icon: 'profile-circle'
      }
    };
    
    const config = roleConfig[role?.toLowerCase()] || {
      color: 'bg-gray-100 text-gray-800',
      icon: 'profile-circle'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <KeenIcon icon={config.icon} className="mr-1.5 text-xs" />
        {role || 'Unknown'}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Name"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <KeenIcon icon="user" className="text-blue-600 text-sm" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">ID: {user.id}</div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Email"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="text-sm text-gray-900">{user.email}</div>
          );
        },
        enableSorting: true,
      },
      {
        accessorFn: (row) => row.agency?.agency_name || '',
        id: "agency_name",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Agency"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <KeenIcon icon="office-bag" className="text-gray-400 text-sm" />
              <span className="text-sm">{user.agency?.agency_name || 'No Agency'}</span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
          accessorKey: "role",
          header: ({ header }) => (
            <DataGridColumnHeader
              column={header.column}
              title="Role"
              filter={<ColumnInputFilter column={header.column} />}
            />
          ),
          cell: ({ row }) => {
            const user = row.original;
            return getRoleBadge(user.role);
          },
          enableSorting: true,
        },
      {
        accessorKey: "created_at",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Created"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="text-sm text-gray-600">
              {formatDate(user.created_at)}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-1">
              <button
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                onClick={() => navigate(`/users/${user.id}/edit`)}
                title={canUpdateUser ? "Edit User" : "View User"}
              >
                <KeenIcon icon={canUpdateUser ? "notepad-edit" : "eye"} className="mr-1 text-xs" />
                {canUpdateUser ? "Edit" : "View"}
              </button>
              
              {user.id !== currentUser.id && (
                <button
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canUpdateUser}
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this user?"
                      )
                    ) {
                      try {
                        await axios.delete(`${baseApi}/users/${user.id}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        toast.success("User deleted successfully");
                        fetchUsers();
                      } catch (error) {
                        console.error("Delete user error:", error);
                        toast.error("Failed to delete user");
                      }
                    }
                  }}
                  title="Delete User"
                >
                  <KeenIcon icon="trash" className="mr-1 text-xs" />
                  Delete
                </button>
              )}

              {user.id !== currentUser.id && (
                <button
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:border-purple-300 transition-colors"
                  onClick={() => navigate(`/users/${user.id}/permissions`)}
                  title="Manage Permissions"
                >
                  <KeenIcon icon="security-user" className="mr-1 text-xs" />
                  Permissions
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [navigate, token, baseApi, canUpdateUser, currentUser]
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <Button
          variant="create"
          onClick={() => navigate("/public-profile/profiles/create")}
          className="flex items-center gap-2"
        >
          <KeenIcon icon="plus" className="text-sm" />
          Create User
        </Button>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        title="User Statistics"
        loading={loading}
        cards={[
          {
            key: 'total',
            title: 'Total Users',
            value: userStats.total,
            icon: 'people',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            route: null
          },
          {
            key: 'roles',
            title: 'Roles',
            value: Object.keys(userStats.byRole).length,
            icon: 'security-user',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            route: null
          },
          {
            key: 'filtered',
            title: 'Filtered Results',
            value: filteredCount,
            icon: 'filter',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            route: null
          }
        ]}
      />

      {/* Role Distribution */}
      {Object.keys(userStats.byRole).length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <KeenIcon icon="chart-pie-simple" className="text-gray-600" />
            Role Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(userStats.byRole).map(([role, count]) => {
              const roleColors = {
                'admin': 'bg-purple-100 text-purple-800 border-purple-200',
                'manager': 'bg-blue-100 text-blue-800 border-blue-200',
                'agent': 'bg-green-100 text-green-800 border-green-200',
                'user': 'bg-gray-100 text-gray-800 border-gray-200'
              };
              const colorClass = roleColors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
              
              return (
                <div key={role} className={`p-4 rounded-lg border-2 ${colorClass} hover:shadow-sm transition-all`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className="text-sm font-medium capitalize">{role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Users List</h3>
            <p className="text-sm text-gray-500">
              Showing {filteredCount} of {users.length} users
            </p>
          </div>
        </div>
        <div className="p-6">
          <DataGrid
            data={users}
            columns={columns}
            serverSide={false}
            rowSelection={false}
            pagination={{ size: 50 }}
            onFilteredDataChange={(count) => setFilteredCount(count)}
          />
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";

export const AllUsersPage = () => {
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);

  const canUpdateUser = currentUser?.permissions?.user?.includes("update");
  // 从 state 中获取 agency_id（如果有）
  const agencyIdFromState = location.state?.agency_id;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = response.data;
      // 如果传入了 agency_id，则只显示该机构下的用户
      if (agencyIdFromState) {
        data = data.filter((user) => user.agency_id === agencyIdFromState);
      }
      setUsers(data);
      setFilteredCount(data.length);
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
        enableSorting: true,
      },
      {
        accessorKey: "agency_name",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Agency"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
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
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="edit"
                size="sm"
                onClick={() => navigate(`/users/${user.id}/edit`)}
              >
                {canUpdateUser ? "Edit" : "View"}
              </Button>
              {
                /* 只有当被遍历的 user 不是当前登录用户时，才展示 Delete 按钮 */
                user.id !== currentUser.id && (
                  <Button
                    variant="delete"
                    size="sm"
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
                  >
                    Delete
                  </Button>
                )
              }

              {user.id !== currentUser.id && (
                <Button
                  className="btn btn-secondary btn-sm"
                  size="sm"
                  onClick={() => navigate(`/users/${user.id}/permissions`)}
                >
                  Permissions
                </Button>
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
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <div className="mb-4 flex justify-end">
        <Button
          variant="create"
          onClick={() => navigate("/public-profile/profiles/create")}
        >
          Create User
        </Button>
      </div>
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredCount} of {users.length} users
        </p>
        <DataGrid
          data={users}
          columns={columns}
          serverSide={false}
          rowSelection={false}
          pagination={{ size: 100 }}
          onFilteredDataChange={(count) => setFilteredCount(count)}
        />
      </div>
    </div>
  );
};

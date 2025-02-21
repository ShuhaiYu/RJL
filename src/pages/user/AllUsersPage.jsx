import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useNavigate } from "react-router-dom";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const AllUsersPage = () => {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
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
  }, [token]);

  // 定义 datagrid 列过滤器
  const ColumnInputFilter = ({ column }) => (
    <Input
      placeholder="Filter..."
      value={column.getFilterValue() ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="h-9 w-full max-w-40"
    />
  );

  const columns = useMemo(() => [
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
              Edit
            </Button>
            <Button
              variant="delete"
              size="sm"
              onClick={async () => {
                if(window.confirm("Are you sure you want to delete this user?")){
                  try{
                    await axios.delete(`${baseApi}/users/${user.id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    toast.success("User deleted successfully");
                    fetchUsers();
                  } catch(error){
                    console.error("Delete user error:", error);
                    toast.error("Failed to delete user");
                  }
                }
              }}
            >
              Delete
            </Button>
            <Button
              className='btn btn-secondary'
              size="sm"
              onClick={() => navigate(`/users/${user.id}/permissions`)}
            >
              Permissions
            </Button>
          </div>
        );
      },
    },
  ], [navigate, token, baseApi]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="mb-4 flex justify-end">
        <Button variant="create" onClick={() => navigate("/public-profile/profiles/create")}>
          Create User
        </Button>
      </div>
      <div className="mb-6">
        <DataGrid
          data={users}
          columns={columns}
          serverSide={false}
          rowSelection={false}
          pagination={{ size: 100 }}
        />
      </div>
      {loading && <div>Loading...</div>}
    </div>
  );
};

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"; // Using the provided Checkbox component

// Define available permissions per scope
const permissionOptions = {
  agency: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"], // 这里 key 仍是 "task" 不变
  contact: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
};

// 如果有更多需要特殊显示的，可以继续加
const scopeDisplayNameMap = {
  task: "Job Order",
  // 其他不变的话，就不需要映射，直接显示 scope 自己
};

export default function ModifyUserPermissionPage() {
  const { id } = useParams(); // Target user id to modify
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  // permissions format: { scope: [permission, ...] }
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  // Get current user's permission object (for all scopes)
  const currentUserPermissions = currentUser?.permissions || {};

  // If a user is trying to edit their own permissions, disallow it.
  const isEditingSelf = currentUser?.id === Number(id);

  // Fetch target user details and permissions
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${baseApi}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        // Assume returned permissions format: { user: [...], agency: [...], ... }
        setPermissions(response.data.permissions || {});
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to fetch user details");
      }
    };
    if (token && id) {
      fetchUser();
    }
  }, [token, id, baseApi]);

  // Determine if a checkbox for a given scope and permission should be disabled.
  // The rule: the current user can only modify permissions within their own permission set.
  const getCheckboxDisabled = (scope, permission) => {
    // If editing self, all checkboxes are disabled.
    if (isEditingSelf) return true;
    // If current user does not have this permission under the given scope, then disable.
    const allowed = currentUserPermissions[scope] || [];
    return !allowed.includes(permission);
  };

  const handleCheckboxChange = (scope, permission, checked) => {
    setPermissions((prev) => {
      const current = prev[scope] || [];
      let updated;
      if (checked) {
        updated = [...current, permission];
      } else {
        updated = current.filter((p) => p !== permission);
      }
      return { ...prev, [scope]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditingSelf) {
      toast.error("You cannot modify your own permissions");
      return;
    }
    setLoading(true);
    try {
      // Assume the update API is PUT /users/:id/permissions with body { permissions }
      await axios.put(
        `${baseApi}/users/${id}/permissions`,
        { permissions },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("User permissions updated successfully");
      navigate("/users");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    }
    setLoading(false);
  };

  if (!userData) {
    return <div className="p-4 text-center">Loading user details...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl bg-white shadow rounded-md">
      {/* Back button */}
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate(-1)}
      >
        Back <i className="ki-filled ki-arrow-left"></i>
      </button>
      <h1 className="text-3xl font-bold mb-6">Modify User Permissions</h1>
      {isEditingSelf && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-red-600 font-semibold">
            You are not allowed to modify your own permissions.
          </p>
        </div>
      )}
      <div className="mb-6 border-b pb-4">
        <p>
          <strong>Name:</strong> {userData.name}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Role:</strong> {userData.role}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {Object.keys(permissionOptions).map((scope) => {
          // 如果在 scopeDisplayNameMap 中有映射，就用对应名字，否则用 scope 本身
          const displayName = scopeDisplayNameMap[scope] || scope;

          return (
            <div key={scope} className="border p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {displayName} Permissions
              </h2>
              <div className="flex flex-wrap gap-6">
                {permissionOptions[scope].map((perm) => {
                  const isChecked = permissions[scope]?.includes(perm) || false;
                  const disabled = getCheckboxDisabled(scope, perm);
                  return (
                    <label
                      key={perm}
                      className="flex items-center gap-2 cursor-pointer"
                      title={
                        disabled
                          ? "You do not have permission to modify this permission"
                          : ""
                      }
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(scope, perm, checked)
                        }
                      />
                      <span className="capitalize">{perm}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="flex gap-4">
          <Button variant="edit" type="submit" disabled={loading || isEditingSelf}>
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button variant="default" type="button" onClick={() => navigate("/users")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

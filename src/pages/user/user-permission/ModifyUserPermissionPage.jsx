'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"; // Using the provided Checkbox component

// Define available permissions per scope
const permissionOptions = {
  user: ["create", "read", "update", "delete"],
  agency: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  contact: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
};

export const ModifyUserPermissionPage = () => {
  const { id } = useParams(); // Get user id from route parameters
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  // permissions format: { scope: [permission, ...] }
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  // currentUserRole is the role of the logged in user (who is modifying permissions)
  const currentUserRole = auth?.role || "";

  // Function to decide if a checkbox should be disabled based on current user's role
  const getCheckboxDisabled = (scope, permission) => {
    if (currentUserRole === "admin" || currentUserRole === "superuser") {
      return false; // Full permissions
    } else if (currentUserRole === "agency-admin") {
      // Cannot Create or Delete for agency and role
      if ((scope === "agency" || scope === "role") && (permission === "create" || permission === "delete")) {
        return true;
      }
      return false;
    } else if (currentUserRole === "agency-user") {
      // Cannot modify any agency or role permissions, and cannot delete for user scope
      if (scope === "agency" || scope === "role") {
        return true;
      }
      if (scope === "user" && permission === "delete") {
        return true;
      }
      return false;
    }
    return false;
  };

  // Fetch user details and permissions
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
      <h1 className="text-3xl font-bold mb-6">Modify User Permissions</h1>
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
        {Object.keys(permissionOptions).map((scope) => (
          <div key={scope} className="border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {scope} Permissions
            </h2>
            <div className="flex flex-wrap gap-6">
              {permissionOptions[scope].map((perm) => {
                const isChecked = permissions[scope]?.includes(perm) || false;
                const disabled = getCheckboxDisabled(scope, perm);
                return (
                  <label
                    key={perm}
                    className="flex items-center gap-2 cursor-pointer"
                    title={disabled ? "You do not have permission to modify this permission" : ""}
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
        ))}
        <div className="flex gap-4">
          <Button variant="edit" type="submit" disabled={loading}>
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

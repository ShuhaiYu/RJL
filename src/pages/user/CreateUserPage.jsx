import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import AsyncAgencySelect from "../../components/custom/AsyncAgencySelect";
import { useNavigate } from "react-router-dom";

// Available permission scopes/values
const permissionOptions = {
  user: ["create", "read", "update", "delete"],
  agency: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  contact: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
};

// Default permission sets for each role we can create
// Adjust these defaults based on your actual needs
const defaultRolePermissions = {
  "agency-admin": {
    user: ["create", "read", "update"],
    agency: ["read", "update"],
    property: ["create", "read", "update"],
    task: ["create", "read", "update"],
    contact: ["create", "read", "update"],
    role: [], // agency-admin typically can't manage roles
  },
  "agency-user": {
    user: ["read"],
    agency: ["read"],
    property: ["read", "update"],
    task: ["create", "read", "update"],
    contact: ["create", "read", "update"],
    role: [], // no role management
  },
};

/**
 * Helper to clamp the assigned permissions to not exceed the current user's own
 * If the creator doesn't have a scope's permission, that permission is removed.
 */
function clampPermissionsToCurrentUser(creatorPermissions, newUserPermissions) {
  const clamped = {};
  for (const scope of Object.keys(newUserPermissions)) {
    const newPerms = newUserPermissions[scope] || [];
    const creatorPerms = creatorPermissions[scope] || [];
    // Keep only the ones the creator also has
    const filtered = newPerms.filter((p) => creatorPerms.includes(p));
    if (filtered.length > 0) {
      clamped[scope] = filtered;
    }
  }
  return clamped;
}

export default function CreateUserPage() {
  const { auth, currentUser, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const navigate = useNavigate();

  // Current user’s own permissions
  const currentUserPermissions = currentUser?.permissions || {};

  // Based on current user’s role, define which roles are creatable
  let creatableRoles = [];
  // For example:
  // superuser/admin => can create ["agency-admin","agency-user"]
  // agency-admin => can create ["agency-user"]
  // else => can create none
  if (currentUser?.role === "superuser" || currentUser?.role === "admin") {
    creatableRoles = ["agency-admin", "agency-user"];
  } else if (currentUser?.role === "agency-admin") {
    creatableRoles = ["agency-user"];
  }

  // Agency selection for superuser/admin
  const [agencies, setAgencies] = useState([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState("");

  // Basic user info form
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "", // to be chosen from creatableRoles
  });
  const [permissions, setPermissions] = useState({}); // { scope: [perm,...], ... }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If creatableRoles is empty => the user cannot create anything
  const canCreate = creatableRoles.length > 0;

  // Load agencies if superuser/admin
  useEffect(() => {
    if (currentUser?.role === "superuser" || currentUser?.role === "admin") {
      axios
        .get(`${baseApi}/agencies`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setAgencies(res.data || []))
        .catch((err) => console.error("Failed to load agencies", err));
    }
  }, [currentUser?.role, token, baseApi]);

  // Whenever the user selects a role, apply default permissions for that role
  // and clamp them to the current user's own permission set
  const handleRoleChange = (newRole) => {
    setForm((prev) => ({ ...prev, role: newRole }));
    if (defaultRolePermissions[newRole]) {
      // Make a copy of the default
      const rawDefaults = JSON.parse(
        JSON.stringify(defaultRolePermissions[newRole])
      );
      const clamped = clampPermissionsToCurrentUser(
        currentUserPermissions,
        rawDefaults
      );
      setPermissions(clamped);
    } else {
      setPermissions({});
    }
  };

  // Generic change handler for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Permission checkbox logic
  const handleCheckboxChange = (scope, permission, checked) => {
    setPermissions((prev) => {
      const currentScopePerms = prev[scope] || [];
      let updated;
      if (checked) {
        updated = [...currentScopePerms, permission];
      } else {
        updated = currentScopePerms.filter((p) => p !== permission);
      }
      // still clamp to currentUser's perms in case user tries to check something they don't have
      const creatorPerms = currentUserPermissions[scope] || [];
      updated = updated.filter((p) => creatorPerms.includes(p));

      return { ...prev, [scope]: updated };
    });
  };

  // If the creator doesn't have the scope/permission, disable
  const getCheckboxDisabled = (scope, permission) => {
    if (!canCreate) return true; // can't create at all
    const creatorPerms = currentUserPermissions[scope] || [];
    return !creatorPerms.includes(permission);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!canCreate) {
      setError("You do not have permission to create new users.");
      setLoading(false);
      return;
    }

    // Confirm password
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Must choose a role from the allowed list
    if (!creatableRoles.includes(form.role)) {
      setError("Invalid role selection.");
      setLoading(false);
      return;
    }

    // If superuser/admin => must choose an agency
    let finalAgencyId = null;
    if (currentUser?.role === "superuser" || currentUser?.role === "admin") {
      if (!selectedAgencyId) {
        setError("Please select an agency.");
        setLoading(false);
        return;
      }
      finalAgencyId = selectedAgencyId;
    }
    // If agency-admin => use their own agency
    else if (currentUser?.role === "agency-admin") {
      finalAgencyId = currentUser?.agency_id || null;
    }

    // Double-check final permission set
    // Because user might have changed some checkboxes
    // We clamp them again just in case
    const finalPermissions = clampPermissionsToCurrentUser(
      currentUserPermissions,
      permissions
    );

    // Construct payload for register
    const payload = {
      email: form.email,
      password: form.password,
      name: form.name,
      role: form.role,
      agency_id: finalAgencyId,
      permissions: finalPermissions, // We assume the backend can handle this
    };

    // Confirm
    const confirmed = window.confirm(
      `Create new user with role "${form.role}"?`
    );
    if (!confirmed) {
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${baseApi}/users`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User created successfully!");
      // Reset
      setForm({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        role: "",
      });
      setPermissions({});
      setSelectedAgencyId("");
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err.response?.data?.message || "Failed to create user");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      {/* Back button */}
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate(-1)}
      >
        Back <i className="ki-filled ki-arrow-left"></i>
      </button>

      <div className="card-header py-5">
        <h3 className="card-title text-xl font-bold">Create New User</h3>
      </div>

      {!canCreate && (
        <p className="text-red-500 mb-4">
          You do not have permission to create new users.
        </p>
      )}

      <div className="card-body p-5 bg-white border shadow rounded space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* If superuser/admin => select agency */}
          {(currentUser?.role === "superuser" ||
            currentUser?.role === "admin") && (
            <AsyncAgencySelect onChange={(option) => setSelectedAgencyId(option)} />
          )}

          <div>
            <label className="block mb-2 font-medium">Name (optional)</label>
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
            <label className="block mb-2 font-medium">Email</label>
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
            <label className="block mb-2 font-medium">Password</label>
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
            <label className="block mb-2 font-medium">Confirm Password</label>
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

          {/* Permissions selection (checkboxes) */}
          <div className="border p-4 rounded space-y-4">
            <p className="font-semibold">Custom Permissions</p>
            {/* Role selection */}
            <div>
              <label className="block mb-2 font-medium">Select Role</label>
              <select
                name="role"
                value={form.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={!canCreate}
                className="form-select block w-full border border-gray-300 rounded-md"
              >
                <option value="">-- Choose a role --</option>
                {creatableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {Object.keys(permissionOptions).map((scope) => (
              <div key={scope}>
                <h4 className="text-sm font-medium capitalize mb-2">
                  {scope}:
                </h4>
                <div className="flex flex-wrap gap-4">
                  {permissionOptions[scope].map((perm) => {
                    const isChecked =
                      permissions[scope]?.includes(perm) || false;
                    const disabled = getCheckboxDisabled(scope, perm);
                    return (
                      <label
                        key={perm}
                        className="flex items-center gap-1"
                        title={
                          disabled
                            ? "You do not have permission to assign this"
                            : ""
                        }
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={disabled || !canCreate}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(scope, perm, checked)
                          }
                        />
                        <span className="capitalize text-sm">{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={loading || !canCreate}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </div>
    </div>
  );
}

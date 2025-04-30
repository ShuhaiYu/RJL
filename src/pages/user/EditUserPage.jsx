"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditUserPage() {
  const { id } = useParams(); // User ID to edit
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  // Extract current user's permissions from auth context.
  // We assume permissions are stored in an object with a "user" key for user operations.
  const userPermissions = currentUser?.permissions || {};
  const hasUpdatePermission = userPermissions.user?.includes("update");
  const hasDeletePermission = userPermissions.user?.includes("delete");

  // State to hold user data
  const [userData, setUserData] = useState({
    email: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch user details when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseApi}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Populate state with user details
        setUserData({
          email: response.data.email || "",
          name: response.data.name || "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchUser();
    }
  }, [token, id, baseApi]);

  // Generic change handler for inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasUpdatePermission) {
      toast.error("You do not have permission to update this user");
      return;
    }
    setSaving(true);
    try {
      const response = await axios.put(`${baseApi}/users/${id}`, userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        toast.success("User updated successfully");
        navigate("/users");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!hasDeletePermission) {
      toast.error("You do not have permission to delete this user");
      return;
    }
    try {
      const response = await axios.delete(`${baseApi}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 204) {
        toast.success("User deleted successfully");
        navigate("/users");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading user details...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl ">
      {/* Back button */}
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate("/users")}
      >
        Back <i className="ki-filled ki-arrow-left"></i>
      </button>
      <div className="mx-auto p-6 max-w-2xl bg-white shadow rounded-md">
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-lg font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            disabled={!hasUpdatePermission}
            className="input input-bordered w-full"
            placeholder="Enter name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-lg font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            disabled={!hasUpdatePermission}
            className="input input-bordered w-full"
            placeholder="Enter email address"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button
              variant="edit"
              type="submit"
              disabled={saving || !hasUpdatePermission}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          <Button
            variant="delete"
            type="button"
            disabled={!hasDeletePermission}
            onClick={handleDelete}
          >
            Delete User
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
};

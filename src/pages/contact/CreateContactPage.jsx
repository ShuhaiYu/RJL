import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/auth";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";
import AsyncPropertySelect from "../../components/custom/AsyncPropertySelect";

export const CreateContactPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  // 如果从页面导航中传入了 propertyId，则预填充 formData.property_id
  const propertyIdFromState = location.state?.propertyId;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    property_id: propertyIdFromState || "",
  });
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loading, setLoading] = useState(false);

  // 如果没有预设propertyId，则不需要加载全部房产
  useEffect(() => {
    if (propertyIdFromState) {
      setLoadingProperties(false);
    } else {
      // 可选：预加载房产列表，这里可留空，AsyncPropertySelect 会异步加载
      setLoadingProperties(false);
    }
  }, [propertyIdFromState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.property_id
    ) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${baseApi}/contacts`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success("Contact created successfully!");
        // 返回到之前页面
        navigate(-1);
      }
    } catch (error) {
      console.error("Create failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to create contact."
      );
    }
    setLoading(false);
  };

  if (loadingProperties) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        <h3 className="card-title text-xl font-bold">Create New Contact</h3>
      </div>
      <div className="card-body p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              className="input input-bordered w-full"
              placeholder="Enter contact name"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" htmlFor="phone">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              className="input input-bordered w-full"
              placeholder="Enter phone number"
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              className="input input-bordered w-full"
              placeholder="Enter email address"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" htmlFor="property_id">
              Select Property
            </label>
            {propertyIdFromState ? (
              <input
                type="text"
                value={formData.property_id}
                className="input input-bordered w-full"
                disabled
              />
            ) : (
              <AsyncPropertySelect
                onChange={(option) =>
                  setFormData({ ...formData, property_id: option ? option.value : "" })
                }
                placeholder="Search property by address..."
              />
            )}
          </div>
          <Button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Contact"}
          </Button>
        </form>
      </div>
    </div>
  );
};

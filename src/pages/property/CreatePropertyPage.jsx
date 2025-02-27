import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/auth";
import { toast } from "sonner";
import AsyncUserSelect from "../../components/custom/AsyncUserSelect";
// 导入 AddressInput 组件
import AddressInput from "../../components/custom/AddressInput";

export default function CreatePropertyPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState(""); // 存储选中的 user

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseApi}/properties`,
        { address, user_id: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Property created successfully!");
      navigate(`/property/${response.data.data.id}`);
    } catch (error) {
      console.error("Create property error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="card-header py-5">
        <h3 className="card-title text-xl font-bold">Create New Property</h3>
      </div>
      <div className="card-body p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Address</label>
            {/* 使用 AddressInput 组件替换原有的 input */}
            <AddressInput
              value={address}
              onChange={(formattedAddress) => setAddress(formattedAddress)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">
              Assign to User (Required)
            </label>
            <AsyncUserSelect
              onChange={(option) =>
                setSelectedUserId(option ? option.value : "")
              }
            />
          </div>
          <div>
            <Button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

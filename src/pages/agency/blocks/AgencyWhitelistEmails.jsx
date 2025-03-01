import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";

/**
 * 机构白名单管理组件
 * 对接后端 /agencies/:agencyId/whitelist
 */
export default function AgencyWhitelistEmails({ agencyId }) {
  const [whitelist, setWhitelist] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  // 初次渲染时，获取白名单列表
  useEffect(() => {
    if (!token || !agencyId) return;
    fetchWhitelist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, agencyId]);

  /**
   * 从后端获取白名单列表
   */
  const fetchWhitelist = async () => {
    try {
      const res = await axios.get(`${baseApi}/agencies/${agencyId}/whitelist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWhitelist(res.data || []);
    } catch (err) {
      console.error("Failed to fetch whitelist", err);
      toast.error(err.response?.data?.message || "Failed to fetch whitelist");
    }
  };

  /**
   * 点击“Add”或“Save”时
   */
  const handleAddOrUpdate = async () => {
    const email = newEmail.trim();
    if (!email) {
      toast.error("Email address cannot be empty");
      return;
    }

    try {
      if (editingItem) {
        // 调用后端PUT更新
        const res = await axios.put(
          `${baseApi}/agencies/${agencyId}/whitelist/${editingItem.id}`,
          { email_address: email },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Email updated");
        // 局部更新 or 重新拉取
        setWhitelist((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? res.data : item
          )
        );
      } else {
        // 调用后端POST新增
        const res = await axios.post(
          `${baseApi}/agencies/${agencyId}/whitelist`,
          { email_address: email },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Email added");
        setWhitelist((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error("Failed to add/update email", err);
      toast.error(err.response?.data?.message || "Failed to add/update email");
    }

    // 清空输入 & 退出编辑态
    setNewEmail("");
    setEditingItem(null);
  };

  /**
   * 点击"Edit"
   */
  const handleEdit = (item) => {
    setEditingItem(item);
    setNewEmail(item.email_address);
  };

  /**
   * 点击"Delete"
   */
  const handleDelete = async (itemId) => {
    try {
      await axios.delete(
        `${baseApi}/agencies/${agencyId}/whitelist/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Email deleted");
      setWhitelist((prev) => prev.filter((w) => w.id !== itemId));
    } catch (err) {
      console.error("Failed to delete email", err);
      toast.error(err.response?.data?.message || "Failed to delete email");
    }
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    setNewEmail("");
    setEditingItem(null);
  };

  return (
    <div>
      {/* 输入框 + 新增/保存按钮 */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Enter email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Button onClick={handleAddOrUpdate}>
          {editingItem ? "Save" : "Add"}
        </Button>
        {editingItem && (
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* 表格展示白名单 */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {whitelist.length === 0 ? (
              <tr>
                <td className="px-4 py-2" colSpan={3}>
                  No whitelist emails found.
                </td>
              </tr>
            ) : (
              whitelist.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.email_address}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
// import axios from "axios";  // 等对接真实接口时再启用
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * 机构白名单管理组件 (当前用 Dummy Data 演示)
 * 将来可对接后端: /agencies/:id/whitelist
 */
export default function AgencyWhitelistEmails({ agencyId }) {
  // 假数据: 初始若干白名单记录
  const [whitelist, setWhitelist] = useState([
    { id: 1, email_address: "abc@example.com" },
    { id: 2, email_address: "hello@domain.com" },
  ]);

  // 用于“新增或编辑”输入的文本
  const [newEmail, setNewEmail] = useState("");
  // 是否处于编辑模式，以及当前编辑的记录
  const [editingItem, setEditingItem] = useState(null);

  // 如果需要在初始时从后端获取数据，可在 useEffect 中发请求
  // useEffect(() => {
  //   async function fetchWhitelist() {
  //     try {
  //       const res = await axios.get(`/agencies/${agencyId}/whitelist`);
  //       setWhitelist(res.data || []);
  //     } catch (err) {
  //       console.error("Failed to fetch whitelist", err);
  //     }
  //   }
  //   fetchWhitelist();
  // }, [agencyId]);

  /**
   * 点击“Add”或“Save”时触发
   */
  const handleAddOrUpdate = () => {
    const email = newEmail.trim();
    if (!email) {
      toast.error("Email address cannot be empty");
      return;
    }
    // 如果是编辑模式
    if (editingItem) {
      // Dummy更新
      setWhitelist((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, email_address: email } : item
        )
      );
      toast.success("Email updated (dummy)");
    } else {
      // Dummy新增
      const newId = Math.max(...whitelist.map((w) => w.id)) + 1;
      setWhitelist((prev) => [
        ...prev,
        { id: newId, email_address: email },
      ]);
      toast.success("Email added (dummy)");
    }
    // 清空输入框 & 重置编辑态
    setNewEmail("");
    setEditingItem(null);

    // 真正对接后端时：
    // if (editingItem) {
    //   await axios.put(`/agencies/${agencyId}/whitelist/${editingItem.id}`, { email_address: email });
    // } else {
    //   await axios.post(`/agencies/${agencyId}/whitelist`, { email_address: email });
    // }
    // 然后刷新列表
  };

  /**
   * 点击“Edit”按钮
   */
  const handleEdit = (item) => {
    setEditingItem(item);
    setNewEmail(item.email_address);
  };

  /**
   * 点击“Delete”按钮
   */
  const handleDelete = (itemId) => {
    // dummy 删除
    setWhitelist((prev) => prev.filter((w) => w.id !== itemId));
    toast.success("Email deleted (dummy)");

    // 真正后端时：
    // await axios.delete(`/agencies/${agencyId}/whitelist/${itemId}`);
    // 刷新列表
  };

  /**
   * 点击“Cancel”按钮
   */
  const handleCancel = () => {
    setNewEmail("");
    setEditingItem(null);
  };

  return (
    <div>
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

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Actions</th>
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

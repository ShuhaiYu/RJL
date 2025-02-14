import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";

/**
 * StatusSelectCell
 * 单元格组件：显示下拉选择框可改“status”，不同状态不同颜色。
 *
 * @param {Object} props.task - 当前行任务
 * @param {Function} props.onStatusUpdated - 修改成功后，通知父组件刷新或做别的事（可选）
 */
function StatusSelectCell({ task, onStatusUpdated }) {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  // 本地状态，用来及时切换下拉UI
  const [status, setStatus] = useState(task.status);

  // 不同状态对应不同样式
  const statusColorClasses = {
    unknown: "bg-gray-100 text-gray-700",
    undo: "bg-red-100 text-red-700",
    doing: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };

  const handleChange = async (e) => {
    const newStatus = e.target.value;

    // 先行更新UI
    setStatus(newStatus);

    try {
      // 调用后端接口更新status
      await axios.put(
        `${baseApi}/tasks/${task.id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Status updated!");
      // 如果父层想在此时刷新表格，可以 onStatusUpdated() 回调
      onStatusUpdated?.(task.id, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
      // 回退UI
      setStatus(task.status);
    }
  };

  // 选择框的样式 - 根据当前status显示背景色
  const colorClass = statusColorClasses[status] || "bg-gray-100 text-gray-700";

  return (
    <select
      value={status}
      onChange={handleChange}
      className={`rounded px-2 py-1 ${colorClass}`}
    >
      <option value="unknown">unknown</option>
      <option value="undo">undo</option>
      <option value="doing">doing</option>
      <option value="done">done</option>
    </select>
  );
}

export default StatusSelectCell;

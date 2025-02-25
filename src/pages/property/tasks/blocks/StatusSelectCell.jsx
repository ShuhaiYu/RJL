import { useEffect, useState } from "react";
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
    // UNKNOWN: 使用柔和的黄色，表示需要关注和处理
    UNKNOWN: "bg-amber-50 text-amber-700 border-amber-200",

    // UNDO: 使用醒目的橙色，表示需要重点关注和行动
    INCOMPLETE: "bg-orange-50 text-orange-700 border-orange-200",

    // DOING: 使用温和的蓝色，表示正在进行中但不需要立即关注
    PROCESSING: "bg-sky-50 text-sky-700 border-sky-200",

    // DONE: 使用清新的绿色，表示已完成
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",

    // CANCEL: 使用中性的灰色，表示已取消
    CANCEL: "bg-gray-100 text-gray-500 border-gray-200",
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

  useEffect(() => {
    onStatusUpdated?.(task.id, status);
  }, [status]);

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={task.status === "COMPLETED"}
      className={`rounded px-2 py-1 ${colorClass}`}
    >
      <option value="UNKNOWN">UNKNOWN</option>
      <option value="INCOMPLETE">INCOMPLETE</option>
      <option value="PROCESSING">PROCESSING</option>
      {status === "COMPLETED" && <option value="COMPLETED">COMPLETED</option>}
      <option value="CANCEL">CANCEL</option>
    </select>
  );
}

export default StatusSelectCell;

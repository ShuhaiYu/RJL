// src/pages/Dashboard/blocks/TasksDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/auth";

const statusColorClasses = {
  UNKNOWN: "bg-amber-50 text-amber-700 border-amber-200",
  INCOMPLETE: "bg-orange-50 text-orange-700 border-orange-200",
  PROCESSING: "bg-sky-50 text-sky-700 border-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DUE_SOON: "bg-red-50 text-red-700 border-red-200",
  EXPIRED: "bg-red-100 text-red-700 border-red-200",
  HISTORY: "bg-gray-100 text-gray-500 border-gray-200",
  "smoke alarm": "bg-purple-50 text-purple-700 border-purple-200",
  "gas & electric": "bg-blue-50 text-blue-700 border-blue-200",
};

// 定义 9 个卡片配置
const cardConfigs = [
  {
    key: "UNKNOWN",
    label: "Unknown",
    route: "/property/tasks?status=UNKNOWN",
  },
  {
    key: "INCOMPLETE",
    label: "Incomplete",
    route: "/property/tasks?status=INCOMPLETE",
  },
  {
    key: "PROCESSING",
    label: "Processing",
    route: "/property/tasks?status=PROCESSING",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    route: "/property/tasks?status=COMPLETED",
  },
  {
    key: "DUE_SOON",
    label: "Due Soon",
    route: "/property/tasks?status=DUE_SOON",
  },
  {
    key: "EXPIRED",
    label: "Expired",
    route: "/property/tasks?status=EXPIRED",
  },
  {
    key: "HISTORY",
    label: "History",
    route: "/property/tasks?status=HISTORY",
  },
  {
    key: "smoke alarm",
    label: "Smoke Alarm",
    route: "/property/tasks?type=smoke_alarm",
  },
  {
    key: "gas & electric",
    label: "Gas & Electric",
    route: "/property/tasks?type=gas_electric",
  },
];

export default function TasksDashboard() {
  const navigate = useNavigate();
  const { auth, baseApi, currentUser } = useAuthContext(); 
  // 假设在 useAuthContext 中你能拿到 { currentUser }, 其中有 currentUser.agency_id
  
  const token = auth?.accessToken;

  // 存放每个 key 对应的数量
  const [counts, setCounts] = useState({
    UNKNOWN: 0,
    INCOMPLETE: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    DUE_SOON: 0,
    EXPIRED: 0,
    HISTORY: 0,
    "smoke alarm": 0,
    "gas & electric": 0,
  });

  // ========== 根据是否是 agency 用户来过滤 UNKNOWN 卡 ==========
  const isAgencyUser = !!currentUser?.agency_id;
  let visibleCards = cardConfigs;
  if (isAgencyUser) {
    // agency 用户，过滤掉 UNKNOWN
    visibleCards = cardConfigs.filter((cfg) => cfg.key !== "UNKNOWN");
  }

  // 从后端获取各个状态/类型的数量
  const fetchCounts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${baseApi}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      setCounts({
        UNKNOWN: data.unknown_count || 0,
        INCOMPLETE: data.incomplete_count || 0,
        PROCESSING: data.processing_count || 0,
        COMPLETED: data.completed_count || 0,
        DUE_SOON: data.due_soon_count || 0,
        EXPIRED: data.expired_count || 0,
        HISTORY: data.history_count || 0,
        "smoke alarm": data.smoke_alarm_count || 0,
        "gas & electric": data.gas_electric_count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard counts:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [token]);

  // 点击卡片，跳转到对应页面
  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* 网格布局，手机一列，平板两列，桌面三列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {visibleCards.map((item) => {
          // 根据 key 拿到数量 & 颜色
          const count = counts[item.key] || 0;
          const colorClass = statusColorClasses[item.key] || "bg-gray-50 text-gray-700 border-gray-200";

          return (
            <div
              key={item.key}
              className={`border rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition ${colorClass}`}
              onClick={() => handleCardClick(item.route)}
            >
              <div className="text-xl font-semibold mb-2">{item.label}</div>
              <div className="text-3xl font-bold">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

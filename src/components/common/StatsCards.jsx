import { KeenIcon } from "@/components/keenicons";
import { useNavigate } from "react-router-dom";

/**
 * 通用统计卡片组件
 * 统一样式，与My Profile中的Statistics Overview保持一致
 * @param {Object} props
 * @param {Array} props.cards - 统计卡片数据数组，每个卡片可包含：
 *   - key: 唯一标识
 *   - title: 标题
 *   - value: 数值
 *   - icon: 图标名称
 *   - color: 图标颜色类（如 'text-blue-600'）
 *   - bgColor: 背景颜色类（如 'bg-blue-50'）
 *   - borderColor: 边框颜色类（如 'border-blue-200'）
 *   - route: 点击跳转路由
 * @param {string} props.title - 标题
 * @param {boolean} props.loading - 加载状态
 * @param {Object} props.totalStats - 总计统计（可选）
 */
const StatsCards = ({ cards = [], title = "Statistics Overview", loading = false, totalStats = null }) => {
  const navigate = useNavigate();

  const handleCardClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
            <KeenIcon icon="chart-pie-simple" className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-lg border bg-gray-50 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
          <KeenIcon icon="chart-pie-simple" className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`p-6 rounded-lg border cursor-pointer transition-all duration-200 ${
              card.bgColor || 'bg-gray-50'
            } ${
              card.borderColor || 'border-gray-200'
            } hover:shadow-md`}
            onClick={() => handleCardClick(card.route)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                card.bgColor || 'bg-gray-50'
              }`}>
                <KeenIcon icon={card.icon} className={`${card.color || 'text-gray-600'} text-lg`} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700">{card.title}</div>
          </div>
        ))}
      </div>

      {/* 总计统计 */}
      {totalStats && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{totalStats.label}</span>
            <span className="font-semibold text-gray-800">
              {typeof totalStats.value === 'number' ? totalStats.value.toLocaleString() : totalStats.value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCards;
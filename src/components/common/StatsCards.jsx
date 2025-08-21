import { KeenIcon } from "@/components/keenicons";
import { useNavigate } from "react-router-dom";

/**
 * Common statistics cards component
 * Unified styling, consistent with Statistics Overview in My Profile
 * @param {Object} props
 * @param {Array} props.cards - Statistics card data array, each card can contain:
 *   - key: unique identifier
 *   - title: title
 *   - value: numeric value
 *   - icon: icon name
 *   - color: icon color class (e.g. 'text-blue-600')
 *   - bgColor: background color class (e.g. 'bg-blue-50')
 *   - borderColor: border color class (e.g. 'border-blue-200')
 *   - route: click navigation route
 * @param {string} props.title - title
 * @param {boolean} props.loading - loading state
 * @param {Object} props.totalStats - total statistics (optional)
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

      {/* Total Statistics */}
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